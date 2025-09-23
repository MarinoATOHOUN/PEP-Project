from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.mentor import Mentor, MentorshipRequest
from src.routes.auth import token_required
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
            # Demandes envoyées par l'étudiant
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
        
        # Vérifier que l'utilisateur est le mentor concerné
        if mentorship_request.mentor.user_id != current_user.id:
            return jsonify({'message': 'Non autorisé'}), 403
        
        data = request.get_json()
        response = data.get('response')  # 'accepted' ou 'rejected'
        
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

