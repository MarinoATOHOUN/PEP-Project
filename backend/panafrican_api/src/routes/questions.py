from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.question import Question, Answer, QuestionVote
from src.routes.auth import token_required, JWT_SECRET
import json
import jwt

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('/questions', methods=['GET'])
def get_questions():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        subject = request.args.get('subject')
        level = request.args.get('level')
        country = request.args.get('country')
        search = request.args.get('search')
        
        query = Question.query
        
        # Filtres
        if subject:
            query = query.filter(Question.subject == subject)
        if level:
            query = query.filter(Question.level == level)
        if country:
            query = query.filter(Question.country == country)
        if search:
            query = query.filter(Question.title.contains(search) | Question.content.contains(search))
        
        # Pagination et tri par date
        questions_pagination = query.order_by(Question.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )

        # Tenter de récupérer l'utilisateur courant depuis le header Authorization pour inclure l'information de vote
        auth_header = request.headers.get('Authorization')
        current_user = None
        if auth_header:
            try:
                token = auth_header
                if token.startswith('Bearer '):
                    token = token[7:]
                data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                current_user = User.query.get(data['user_id'])
            except Exception:
                current_user = None

        questions_list = []
        for q in questions_pagination.items:
            qd = q.to_dict()
            # Nombre de réponses
            qd['answers'] = len(q.answers)
            # Inclure le vote de l'utilisateur courant si présent
            qd['user_vote'] = None
            if current_user:
                existing = QuestionVote.query.filter_by(user_id=current_user.id, question_id=q.id).first()
                if existing:
                    qd['user_vote'] = 'up' if existing.is_up else 'down'
            questions_list.append(qd)
        
        return jsonify({
            'questions': questions_list,
            'total': questions_pagination.total,
            'pages': questions_pagination.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@questions_bp.route('/questions', methods=['POST'])
@token_required
def create_question(current_user):
    try:
        data = request.get_json()
        
        required_fields = ['title', 'content', 'subject', 'level']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        question = Question(
            title=data['title'],
            content=data['content'],
            subject=data['subject'],
            level=data['level'],
            country=data.get('country', current_user.country),
            user_id=current_user.id
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Question créée avec succès',
            'question': question.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la création: {str(e)}'}), 500

@questions_bp.route('/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    try:
        question = Question.query.get_or_404(question_id)
        
        # Récupérer les réponses
        answers = Answer.query.filter_by(question_id=question_id).order_by(Answer.votes.desc(), Answer.created_at.asc()).all()
        
        question_data = question.to_dict()
        question_data['answers'] = [answer.to_dict() for answer in answers]

        # Tenter de récupérer l'utilisateur courant depuis le header Authorization pour inclure l'information de vote
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header
                if token.startswith('Bearer '):
                    token = token[7:]
                data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                current_user = User.query.get(data['user_id'])
                existing = QuestionVote.query.filter_by(user_id=current_user.id, question_id=question_id).first()
                question_data['user_vote'] = 'up' if existing and existing.is_up else ('down' if existing and not existing.is_up else None)
            except Exception:
                question_data['user_vote'] = None
        else:
            question_data['user_vote'] = None
        
        return jsonify({'question': question_data}), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@questions_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
@token_required
def create_answer(current_user, question_id):
    try:
        question = Question.query.get_or_404(question_id)
        data = request.get_json()
        
        if not data.get('content'):
            return jsonify({'message': 'Contenu de la réponse requis'}), 400
        
        answer = Answer(
            content=data['content'],
            user_id=current_user.id,
            question_id=question_id
        )
        
        db.session.add(answer)
        db.session.commit()
        
        return jsonify({
            'message': 'Réponse créée avec succès',
            'answer': answer.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la création: {str(e)}'}), 500

@questions_bp.route('/questions/<int:question_id>/vote', methods=['POST'])
@token_required
def vote_question(current_user, question_id):
    try:
        question = Question.query.get_or_404(question_id)
        data = request.get_json()
        vote_type = data.get('type')  # 'up' or 'down'

        # Chercher un vote existant de cet utilisateur
        existing = QuestionVote.query.filter_by(user_id=current_user.id, question_id=question_id).first()

        if vote_type not in ('up', 'down'):
            return jsonify({'message': 'Type de vote invalide'}), 400

        is_up = (vote_type == 'up')

        if existing:
            # Si même type -> annuler le vote
            if existing.is_up == is_up:
                db.session.delete(existing)
                question.votes = question.votes - 1 if existing.is_up else question.votes + 1
            else:
                # Changer le sens du vote
                existing.is_up = is_up
                question.votes = question.votes + 2 if is_up else question.votes - 2
        else:
            # Nouveau vote
            new_vote = QuestionVote(user_id=current_user.id, question_id=question_id, is_up=is_up)
            db.session.add(new_vote)
            question.votes = question.votes + 1 if is_up else question.votes - 1

        db.session.commit()

        # Retourner aussi l'état du vote pour le client
        user_vote = None
        existing_after = QuestionVote.query.filter_by(user_id=current_user.id, question_id=question_id).first()
        if existing_after:
            user_vote = 'up' if existing_after.is_up else 'down'

        return jsonify({
            'message': 'Vote enregistré',
            'votes': question.votes,
            'user_vote': user_vote
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors du vote: {str(e)}'}), 500

@questions_bp.route('/answers/<int:answer_id>/vote', methods=['POST'])
@token_required
def vote_answer(current_user, answer_id):
    try:
        answer = Answer.query.get_or_404(answer_id)
        data = request.get_json()
        
        vote_type = data.get('type')  # 'up' ou 'down'
        
        if vote_type == 'up':
            answer.votes += 1
        elif vote_type == 'down':
            answer.votes -= 1
        else:
            return jsonify({'message': 'Type de vote invalide'}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vote enregistré',
            'votes': answer.votes
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors du vote: {str(e)}'}), 500

@questions_bp.route('/answers/<int:answer_id>/accept', methods=['POST'])
@token_required
def accept_answer(current_user, answer_id):
    try:
        answer = Answer.query.get_or_404(answer_id)
        question = Question.query.get(answer.question_id)
        
        # Vérifier que l'utilisateur est l'auteur de la question
        if question.user_id != current_user.id:
            return jsonify({'message': 'Non autorisé'}), 403
        
        # Désaccepter toutes les autres réponses
        Answer.query.filter_by(question_id=question.id).update({'is_accepted': False})
        
        # Accepter cette réponse
        answer.is_accepted = True
        db.session.commit()
        
        return jsonify({
            'message': 'Réponse acceptée',
            'answer': answer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de l\'acceptation: {str(e)}'}), 500

