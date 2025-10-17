from flask import Blueprint, jsonify
from ..models.user import db, User
from ..models.question import Question, Answer

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/stats/helped-students', methods=['GET'])
def get_helped_students():
    try:
        count = db.session.query(Question.user_id).join(Answer).filter(Answer.is_accepted == True).distinct().count()
        return jsonify({'helped_students': count}), 200
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération des statistiques: {str(e)}'}), 500
