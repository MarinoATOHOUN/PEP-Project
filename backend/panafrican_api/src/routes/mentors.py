from flask import Blueprint, request, jsonify
from ..models.user import db, User
from ..models.mentor import Mentor, MentorshipRequest, MentorAvailability, MentorSession
from ..models.notification import Notification
from .auth import token_required
from datetime import datetime, timedelta, time
import json

mentors_bp = Blueprint('mentors', __name__)

@mentors_bp.route('/mentors', methods=['GET'])
def get_mentors():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        specialty = request.args.get('specialty')
        country = request.args.get('country')
        education_level = request.args.get('education_level')
        available_only = request.args.get('available_only', 'true').lower() == 'true'
        
        query = Mentor.query.join(User)
        
        # Filtres
        if specialty:
            query = query.filter(Mentor.specialties.contains(specialty))
        if country:
            query = query.filter(User.country == country)
        if education_level:
            query = query.filter(Mentor.education_level == education_level)
        if available_only:
            query = query.filter(Mentor.is_available == True)
        
        # Pagination et tri par rating
        mentors = query.order_by(Mentor.rating.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        mentor_list = []
        for mentor in mentors.items:
            mentor_data = mentor.to_dict()
            mentor_data['user'] = mentor.user.to_dict()
            mentor_list.append(mentor_data)
        
        return jsonify({
            'mentors': mentor_list,
            'total': mentors.total,
            'pages': mentors.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@mentors_bp.route('/mentors/become', methods=['POST'])
@token_required
def become_mentor(current_user):
    try:
        # Vérifier si l'utilisateur est déjà mentor
        existing_mentor = Mentor.query.filter_by(user_id=current_user.id).first()
        if existing_mentor:
            return jsonify({'message': 'Vous êtes déjà mentor'}), 400
        
        data = request.get_json()
        
        required_fields = ['specialties', 'experience_years', 'education_level', 'institution']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        mentor = Mentor(
            user_id=current_user.id,
            specialties=json.dumps(data['specialties']) if isinstance(data['specialties'], list) else data['specialties'],
            experience_years=data['experience_years'],
            education_level=data['education_level'],
            institution=data['institution'],
            bio=data.get('bio', '')
        )
        
        # Mettre à jour le rôle de l'utilisateur
        current_user.role = 'mentor'
        
        db.session.add(mentor)
        db.session.commit()
        
        return jsonify({
            'message': 'Profil mentor créé avec succès',
            'mentor': mentor.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la création: {str(e)}'}), 500

@mentors_bp.route('/mentors/<int:mentor_id>', methods=['GET'])
def get_mentor(mentor_id):
    try:
        mentor = Mentor.query.get_or_404(mentor_id)
        
        mentor_data = mentor.to_dict()
        mentor_data['user'] = mentor.user.to_dict()
        
        return jsonify({'mentor': mentor_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@mentors_bp.route('/mentors/<int:mentor_id>/request', methods=['POST'])
@token_required
def request_mentorship(current_user, mentor_id):
    try:
        mentor = Mentor.query.get_or_404(mentor_id)
        data = request.get_json()
        
        required_fields = ['subject', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        # Vérifier qu'on ne demande pas à soi-même
        if mentor.user_id == current_user.id:
            return jsonify({'message': 'Vous ne pouvez pas vous demander du mentorat à vous-même'}), 400
        
        # Vérifier s'il y a déjà une demande en cours
        existing_request = MentorshipRequest.query.filter_by(
            student_id=current_user.id,
            mentor_id=mentor_id,
            status='pending'
        ).first()
        
        if existing_request:
            return jsonify({'message': 'Vous avez déjà une demande en cours avec ce mentor'}), 400
        
        mentorship_request = MentorshipRequest(
            student_id=current_user.id,
            mentor_id=mentor_id,
            subject=data['subject'],
            message=data['message'],
            requested_date=data.get('requested_date')
        )
        
        db.session.add(mentorship_request)
        db.session.commit()
        
        return jsonify({
            'message': 'Demande de mentorat envoyée avec succès',
            'request': mentorship_request.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de l\'envoi: {str(e)}'}), 500

@mentors_bp.route('/mentorship/requests', methods=['GET'])
@token_required
def get_mentorship_requests(current_user):
    try:
        # Récupérer les demandes selon le rôle
        if current_user.role == 'mentor':
            # Demandes reçues par le mentor
            mentor = Mentor.query.filter_by(user_id=current_user.id).first()
            if not mentor:
                return jsonify({'requests': []}), 200
            
            requests = MentorshipRequest.query.filter_by(mentor_id=mentor.id).order_by(MentorshipRequest.created_at.desc()).all()
        else:
            # Demandes envoyées par l\'étudiant
            requests = MentorshipRequest.query.filter_by(student_id=current_user.id).order_by(MentorshipRequest.created_at.desc()).all()
        
        request_list = []
        for req in requests:
            req_data = req.to_dict()
            req_data['student'] = req.student.to_dict()
            req_data['mentor'] = req.mentor.to_dict()
            req_data['mentor']['user'] = req.mentor.user.to_dict()
            request_list.append(req_data)
        
        return jsonify({'requests': request_list}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@mentors_bp.route('/mentorship/requests/<int:request_id>/respond', methods=['POST'])
@token_required
def respond_to_request(current_user, request_id):
    try:
        mentorship_request = MentorshipRequest.query.get_or_404(request_id)
        
        # Vérifier que l\'utilisateur est le mentor concerné
        if mentorship_request.mentor.user_id != current_user.id:
            return jsonify({'message': 'Non autorisé'}), 403
        
        data = request.get_json()
        response = data.get('response')  # \'accepted\' ou \'rejected\'
        
        if response not in ['accepted', 'rejected']:
            return jsonify({'message': 'Réponse invalide'}), 400
        
        mentorship_request.status = response
        db.session.commit()
        
        return jsonify({
            'message': f'Demande {response}',
            'request': mentorship_request.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la réponse: {str(e)}'}), 500

# === GESTION DES DISPONIBILITÉS ===

@mentors_bp.route('/mentors/<int:mentor_id>/availabilities', methods=['GET'])
def get_mentor_availabilities(mentor_id):
    """Récupérer les disponibilités d'un mentor"""
    try:
        mentor = Mentor.query.get_or_404(mentor_id)
        availabilities = MentorAvailability.query.filter_by(mentor_id=mentor_id, is_active=True).all()
        
        return jsonify({
            'availabilities': [av.to_dict() for av in availabilities]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur: {str(e)}'}), 500

@mentors_bp.route('/mentors/availabilities', methods=['POST'])
@token_required
def set_mentor_availabilities(current_user):
    """Définir les disponibilités d'un mentor (uniquement pour les mentors)"""
    try:
        # Vérifier que l\'utilisateur est un mentor
        mentor = Mentor.query.filter_by(user_id=current_user.id).first()
        if not mentor:
            return jsonify({'message': 'Vous devez être mentor pour définir vos disponibilités'}), 403
        
        data = request.get_json()
        availabilities_data = data.get('availabilities', [])
        
        # Supprimer les anciennes disponibilités
        MentorAvailability.query.filter_by(mentor_id=mentor.id).delete()
        
        # Ajouter les nouvelles
        for av_data in availabilities_data:
            availability = MentorAvailability(
                mentor_id=mentor.id,
                day_of_week=av_data['day_of_week'],
                start_time=datetime.strptime(av_data['start_time'], '%H:%M').time(),
                end_time=datetime.strptime(av_data['end_time'], '%H:%M').time(),
                is_active=True
            )
            db.session.add(availability)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Disponibilités mises à jour avec succès'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur: {str(e)}'}), 500

@mentors_bp.route('/mentors/<int:mentor_id>/available-slots', methods=['GET'])
def get_available_slots(mentor_id):
    """Récupérer les créneaux disponibles d'un mentor pour les 7 prochains jours"""
    try:
        mentor = Mentor.query.get_or_404(mentor_id)
        
        # Paramètres
        days_ahead = int(request.args.get('days', 7))
        session_duration = int(request.args.get('duration', 60))  # en minutes
        
        # Récupérer les disponibilités du mentor
        availabilities = MentorAvailability.query.filter_by(mentor_id=mentor_id, is_active=True).all()
        
        if not availabilities:
            return jsonify({'slots': []}), 200
        
        # Récupérer les sessions déjà réservées
        start_date = datetime.now()
        end_date = start_date + timedelta(days=days_ahead)
        booked_sessions = MentorSession.query.filter(
            MentorSession.mentor_id == mentor_id,
            MentorSession.session_date >= start_date,
            MentorSession.session_date < end_date,
            MentorSession.status.in_(['scheduled', 'completed'])
        ).all()
        
        # Créer un set des créneaux réservés
        booked_slots = set()
        for session in booked_sessions:
            session_end = session.session_date + timedelta(minutes=session.duration_minutes)
            current = session.session_date
            while current < session_end:
                booked_slots.add(current.strftime('%Y-%m-%d %H:%M'))
                current += timedelta(minutes=30)  # Intervalle de 30 minutes
        
        # Générer les créneaux disponibles
        available_slots = []
        
        for day_offset in range(days_ahead):
            current_date = start_date.date() + timedelta(days=day_offset)
            day_of_week = current_date.weekday()  # 0=Lundi, 6=Dimanche
            
            # Trouver les disponibilités pour ce jour
            day_availabilities = [av for av in availabilities if av.day_of_week == day_of_week]
            
            for availability in day_availabilities:
                # Générer les créneaux pour cette disponibilité
                slot_start = datetime.combine(current_date, availability.start_time)
                slot_end = datetime.combine(current_date, availability.end_time)
                
                current_slot = slot_start
                while current_slot + timedelta(minutes=session_duration) <= slot_end:
                    # Vérifier si c'est dans le futur
                    if current_slot > datetime.now():
                        slot_key = current_slot.strftime('%Y-%m-%d %H:%M')
                        
                        # Vérifier si le créneau n'est pas déjà réservé
                        if slot_key not in booked_slots:
                            available_slots.append({
                                'datetime': current_slot.isoformat(),
                                'date': current_slot.strftime('%Y-%m-%d'),
                                'time': current_slot.strftime('%H:%M'),
                                'day_name': ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][day_of_week],
                                'available': True
                            })
                    
                    current_slot += timedelta(minutes=30)  # Créneaux de 30 minutes
        
        return jsonify({
            'slots': available_slots,
            'total': len(available_slots)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur: {str(e)}'}), 500

# === GESTION DES SESSIONS ===

@mentors_bp.route('/mentors/<int:mentor_id>/book', methods=['POST'])
@token_required
def book_session(current_user, mentor_id):
    """Réserver une session avec un mentor"""
    try:
        mentor = Mentor.query.get_or_404(mentor_id)
        
        # Vérifier qu'on ne réserve pas avec soi-même
        if mentor.user_id == current_user.id:
            return jsonify({'message': 'Vous ne pouvez pas réserver avec vous-même'}), 400
        
        data = request.get_json()
        
        required_fields = ['session_date', 'subject']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        # Parser la date de session
        session_date = datetime.fromisoformat(data['session_date'].replace('Z', '+00:00'))
        
        # Vérifier que la date est dans le futur
        if session_date <= datetime.now():
            return jsonify({'message': 'La date de session doit être dans le futur'}), 400
        
        duration = int(data.get('duration_minutes', 60))
        session_end = session_date + timedelta(minutes=duration)
        
        # Vérifier la disponibilité du créneau de manière robuste
        day_of_session = session_date.date()
        
        # 1. Récupérer les sessions existantes pour ce mentor ce jour-là
        existing_sessions = MentorSession.query.filter(
            MentorSession.mentor_id == mentor_id,
            db.func.date(MentorSession.session_date) == day_of_session,
            MentorSession.status.in_(['scheduled', 'completed'])
        ).all()
        
        # 2. Vérifier le chevauchement en Python
        for existing_session in existing_sessions:
            existing_start = existing_session.session_date
            existing_end = existing_start + timedelta(minutes=existing_session.duration_minutes)
            
            # Logique de chevauchement: (start1 < end2) and (start2 < end1)
            if session_date < existing_end and existing_start < session_end:
                return jsonify({'message': 'Ce créneau est déjà réservé ou chevauche une autre session.'}), 409

        # Si on arrive ici, le créneau est libre
        
        # Créer la session
        session = MentorSession(
            mentor_id=mentor_id,
            student_id=current_user.id,
            session_date=session_date,
            duration_minutes=duration,
            subject=data['subject'],
            description=data.get('description', ''),
            status='scheduled'
        )
        
        db.session.add(session)
        db.session.flush() # Pour obtenir session.id avant le commit
        
        # Créer une notification pour le mentor
        notification_mentor = Notification(
            user_id=mentor.user_id,
            type='session_booking',
            title='Nouvelle réservation de session',
            message=f"{current_user.first_name} {current_user.last_name} a réservé une session avec vous le {session_date.strftime('%d/%m/%Y à %H:%M')}",
            related_id=session.id
        )
        db.session.add(notification_mentor)

        # Créer une notification pour l\'étudiant
        notification_student = Notification(
            user_id=current_user.id,
            type='session_confirmation',
            title='Session confirmée',
            message=f"Votre session avec {mentor.user.first_name} {mentor.user.last_name} le {session_date.strftime('%d/%m/%Y à %H:%M')} est confirmée.",
            related_id=session.id
        )
        db.session.add(notification_student)
        
        # Incrémenter le nombre de sessions du mentor
        mentor.total_sessions += 1
        
        db.session.commit()
        
        session_data = session.to_dict()
        session_data['mentor'] = mentor.to_dict()
        session_data['mentor']['user'] = mentor.user.to_dict()
        session_data['student'] = current_user.to_dict()
        
        return jsonify({
            'message': 'Session réservée avec succès',
            'session': session_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la réservation: {str(e)}'}), 500

@mentors_bp.route('/mentorship/sessions', methods=['GET'])
@token_required
def get_sessions(current_user):
    """Récupérer les sessions de l\'utilisateur (en tant qu\'étudiant ou mentor)"""
    try:
        # Paramètres de filtrage
        role = request.args.get('role', 'student')  # student ou mentor
        status = request.args.get('status')  # scheduled, completed, cancelled
        
        if role == 'mentor':
            mentor = Mentor.query.filter_by(user_id=current_user.id).first()
            if not mentor:
                return jsonify({'sessions': []}), 200
            query = MentorSession.query.filter_by(mentor_id=mentor.id)
        else:
            query = MentorSession.query.filter_by(student_id=current_user.id)
        
        if status:
            query = query.filter_by(status=status)
        
        sessions = query.order_by(MentorSession.session_date.desc()).all()
        
        session_list = []
        for session in sessions:
            session_data = session.to_dict()
            session_data['mentor'] = session.mentor.to_dict()
            session_data['mentor']['user'] = session.mentor.user.to_dict()
            session_data['student'] = session.student.to_dict()
            session_list.append(session_data)
        
        return jsonify({'sessions': session_list}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur: {str(e)}'}), 500

@mentors_bp.route('/mentorship/sessions/<int:session_id>', methods=['GET'])
@token_required
def get_session(current_user, session_id):
    """Récupérer les détails d'une session"""
    try:
        session = MentorSession.query.get_or_404(session_id)
        
        # Vérifier que l\'utilisateur a accès à cette session
        mentor = Mentor.query.get(session.mentor_id)
        if session.student_id != current_user.id and mentor.user_id != current_user.id:
            return jsonify({'message': 'Non autorisé'}), 403
        
        session_data = session.to_dict()
        session_data['mentor'] = mentor.to_dict()
        session_data['mentor']['user'] = mentor.user.to_dict()
        session_data['student'] = session.student.to_dict()
        
        return jsonify({'session': session_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur: {str(e)}'}), 500

@mentors_bp.route('/mentorship/sessions/<int:session_id>/cancel', methods=['POST'])
@token_required
def cancel_session(current_user, session_id):
    """Annuler une session"""
    try:
        session = MentorSession.query.get_or_404(session_id)
        
        # Vérifier que l\'utilisateur a le droit d\'annuler
        mentor = Mentor.query.get(session.mentor_id)
        if session.student_id != current_user.id and mentor.user_id != current_user.id:
            return jsonify({'message': 'Non autorisé'}), 403
        
        # Vérifier que la session n\'est pas déjà terminée
        if session.status in ['completed', 'cancelled']:
            return jsonify({'message': 'Cette session ne peut plus être annulée'}), 400
        
        session.status = 'cancelled'
        
        # Créer une notification pour l\'autre partie
        if session.student_id == current_user.id:
            # L\'étudiant annule -> notifier le mentor
            notification = Notification(
                user_id=mentor.user_id,
                type='session_cancelled',
                title='Session annulée',
                message=f"{current_user.first_name} {current_user.last_name} a annulé la session du {session.session_date.strftime('%d/%m/%Y à %H:%M')}",
                related_id=session.id
            )
        else:
            # Le mentor annule -> notifier l\'étudiant
            notification = Notification(
                user_id=session.student_id,
                type='session_cancelled',
                title='Session annulée',
                message=f"{mentor.user.first_name} {mentor.user.last_name} a annulé la session du {session.session_date.strftime('%d/%m/%Y à %H:%M')}",
                related_id=session.id
            )
        
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Session annulée avec succès',
            'session': session.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur: {str(e)}'}), 500