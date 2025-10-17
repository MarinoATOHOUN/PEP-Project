from flask import Blueprint, request, jsonify
from ..models.user import db, User
from ..models.notification import Notification, Opportunity
from .auth import token_required

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/notifications', methods=['GET'])
@token_required
def get_notifications(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(user_id=current_user.id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'notifications': [notif.to_dict() for notif in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page,
            'unread_count': Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(current_user, notification_id):
    try:
        notification = Notification.query.filter_by(
            id=notification_id, 
            user_id=current_user.id
        ).first_or_404()
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'message': 'Notification marquée comme lue',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la mise à jour: {str(e)}'}), 500

@notifications_bp.route('/notifications/mark-all-read', methods=['POST'])
@token_required
def mark_all_notifications_read(current_user):
    try:
        Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
        db.session.commit()
        
        return jsonify({'message': 'Toutes les notifications marquées comme lues'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la mise à jour: {str(e)}'}), 500

@notifications_bp.route('/opportunities', methods=['GET'])
def get_opportunities():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        opportunity_type = request.args.get('type')
        country = request.args.get('country')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        query = Opportunity.query
        
        # Filtres
        if opportunity_type:
            query = query.filter(Opportunity.type == opportunity_type)
        if country:
            query = query.filter(Opportunity.country == country)
        if active_only:
            query = query.filter(Opportunity.is_active == True)
        
        opportunities = query.order_by(Opportunity.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'opportunities': [opp.to_dict() for opp in opportunities.items],
            'total': opportunities.total,
            'pages': opportunities.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la récupération: {str(e)}'}), 500

@notifications_bp.route('/opportunities', methods=['POST'])
@token_required
def create_opportunity(current_user):
    """Créer une nouvelle opportunité (admin seulement pour la démo)"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'description', 'type', 'organization', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        opportunity = Opportunity(
            title=data['title'],
            description=data['description'],
            type=data['type'],
            organization=data['organization'],
            country=data['country'],
            deadline=data.get('deadline'),
            requirements=data.get('requirements'),
            link=data.get('link')
        )
        
        db.session.add(opportunity)
        db.session.commit()
        
        return jsonify({
            'message': 'Opportunité créée avec succès',
            'opportunity': opportunity.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la création: {str(e)}'}), 500

def create_notification(user_id, title, message, notification_type, related_id=None):
    """Fonction utilitaire pour créer des notifications"""
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            related_id=related_id
        )
        db.session.add(notification)
        db.session.commit()
        return notification
    except Exception as e:
        db.session.rollback()
        print(f"Erreur lors de la création de notification: {str(e)}")
        return None

