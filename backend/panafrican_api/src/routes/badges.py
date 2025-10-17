from flask import Blueprint, request, jsonify
from ..models.user import db, User
from ..models.badge import Badge, UserBadge, UserPoints
from .auth import token_required

badges_bp = Blueprint('badges', __name__)

@badges_bp.route('/badges', methods=['GET'])
def get_badges():
    try:
        category = request.args.get('category')
        
        query = Badge.query
        if category:
            query = query.filter(Badge.category == category)
        
        badges = query.order_by(Badge.points_required.asc()).all()
        
        return jsonify({
            'badges': [badge.to_dict() for badge in badges]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@badges_bp.route('/users/<int:user_id>/badges', methods=['GET'])
def get_user_badges(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user_badges = UserBadge.query.filter_by(user_id=user_id).order_by(UserBadge.earned_at.desc()).all()
        
        return jsonify({
            'user_badges': [ub.to_dict() for ub in user_badges]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@badges_bp.route('/users/<int:user_id>/points', methods=['GET'])
def get_user_points(user_id):
    try:
        user = User.query.get_or_404(user_id)
        user_points = UserPoints.query.filter_by(user_id=user_id).first()
        
        if not user_points:
            # Créer les points si ils n'existent pas
            user_points = UserPoints(user_id=user_id)
            db.session.add(user_points)
            db.session.commit()
        
        return jsonify({
            'points': user_points.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@badges_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category', 'total')  # total, contribution, mentorship, learning
        
        if category == 'total':
            order_by = UserPoints.total_points.desc()
        elif category == 'contribution':
            order_by = UserPoints.contribution_points.desc()
        elif category == 'mentorship':
            order_by = UserPoints.mentorship_points.desc()
        elif category == 'learning':
            order_by = UserPoints.learning_points.desc()
        else:
            return jsonify({'message': 'Catégorie invalide'}), 400
        
        leaderboard = db.session.query(UserPoints, User).join(User).order_by(order_by).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        leaderboard_data = []
        for rank, (points, user) in enumerate(leaderboard.items, start=(page-1)*per_page + 1):
            leaderboard_data.append({
                'rank': rank,
                'user': user.to_dict(),
                'points': points.to_dict()
            })
        
        return jsonify({
            'leaderboard': leaderboard_data,
            'total': leaderboard.total,
            'pages': leaderboard.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@badges_bp.route('/users/points/add', methods=['POST'])
@token_required
def add_points(current_user):
    """Route pour ajouter des points (pour simulation/test)"""
    try:
        data = request.get_json()
        
        points_type = data.get('type', 'contribution')  # contribution, mentorship, learning
        amount = data.get('amount', 10)
        
        user_points = UserPoints.query.filter_by(user_id=current_user.id).first()
        if not user_points:
            user_points = UserPoints(user_id=current_user.id)
            db.session.add(user_points)
        
        # Ajouter les points selon le type
        if points_type == 'contribution':
            user_points.contribution_points += amount
        elif points_type == 'mentorship':
            user_points.mentorship_points += amount
        elif points_type == 'learning':
            user_points.learning_points += amount
        
        # Mettre à jour le total
        user_points.total_points = (user_points.contribution_points + 
                                   user_points.mentorship_points + 
                                   user_points.learning_points)
        
        db.session.commit()
        
        # Vérifier si l'utilisateur mérite de nouveaux badges
        check_and_award_badges(current_user.id)
        
        return jsonify({
            'message': f'{amount} points {points_type} ajoutés',
            'points': user_points.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de l\'ajout: {str(e)}'}), 500

def check_and_award_badges(user_id):
    """Fonction pour vérifier et attribuer automatiquement les badges"""
    try:
        user_points = UserPoints.query.filter_by(user_id=user_id).first()
        if not user_points:
            return
        
        # Récupérer tous les badges
        all_badges = Badge.query.all()
        
        # Récupérer les badges déjà obtenus par l'utilisateur
        earned_badge_ids = [ub.badge_id for ub in UserBadge.query.filter_by(user_id=user_id).all()]
        
        for badge in all_badges:
            if badge.id in earned_badge_ids:
                continue  # Badge déjà obtenu
            
            # Vérifier si l'utilisateur mérite ce badge
            if badge.category == 'contribution' and user_points.contribution_points >= badge.points_required:
                award_badge(user_id, badge.id)
            elif badge.category == 'mentorship' and user_points.mentorship_points >= badge.points_required:
                award_badge(user_id, badge.id)
            elif badge.category == 'learning' and user_points.learning_points >= badge.points_required:
                award_badge(user_id, badge.id)
            elif badge.category == 'general' and user_points.total_points >= badge.points_required:
                award_badge(user_id, badge.id)
                
    except Exception as e:
        print(f"Erreur lors de la vérification des badges: {str(e)}")

def award_badge(user_id, badge_id):
    """Attribuer un badge à un utilisateur"""
    try:
        user_badge = UserBadge(user_id=user_id, badge_id=badge_id)
        db.session.add(user_badge)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de l'attribution du badge: {str(e)}")

