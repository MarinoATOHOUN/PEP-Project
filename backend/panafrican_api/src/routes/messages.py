from flask import Blueprint, request, jsonify
from sqlalchemy import or_, and_
from flask_socketio import emit, join_room, leave_room
from ..models.user import db, User
from ..models.message import Message
from .auth import token_required
from .. import socketio
from datetime import datetime

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/messages', methods=['POST'])
@token_required
def send_message(current_user):
    try:
        data = request.get_json()
        recipient_id = data.get('recipient_id')
        content = data.get('content')

        if not recipient_id or not content:
            return jsonify({'message': 'Recipient and content are required'}), 400

        recipient = User.query.get(recipient_id)
        if not recipient:
            return jsonify({'message': 'Recipient not found'}), 404

        message = Message(
            sender_id=current_user.id,
            recipient_id=recipient_id,
            content=content
        )

        db.session.add(message)
        db.session.commit()

        # Émettre un événement WebSocket à la salle du destinataire
        room = f"user_{recipient_id}"
        socketio.emit('new_message', message.to_dict(), to=room)

        return jsonify({'message': 'Message sent successfully', 'data': message.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error sending message: {str(e)}'}), 500

@messages_bp.route('/messages/conversations', methods=['GET'])
@token_required
def get_conversations(current_user):
    try:
        # Get all users the current user has had a conversation with
        sent_to = db.session.query(Message.recipient_id).filter(Message.sender_id == current_user.id)
        received_from = db.session.query(Message.sender_id).filter(Message.recipient_id == current_user.id)
        
        user_ids = set([item[0] for item in sent_to.all()] + [item[0] for item in received_from.all()])
        
        conversations = []
        for user_id in user_ids:
            user = User.query.get(user_id)
            last_message = Message.query.filter(
                or_(
                    and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
                    and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
                )
            ).order_by(Message.created_at.desc()).first()

            conversations.append({
                'user': user.to_dict_simple(),
                'last_message': last_message.to_dict() if last_message else None
            })

        # Sort conversations by the last message date
        conversations.sort(key=lambda x: x['last_message']['created_at'] if x.get('last_message') else '1970-01-01T00:00:00', reverse=True)

        return jsonify({'conversations': conversations}), 200

    except Exception as e:
        return jsonify({'message': f'Error getting conversations: {str(e)}'}), 500

@messages_bp.route('/messages/conversation/<int:user_id>', methods=['GET'])
@token_required
def get_conversation(current_user, user_id):
    try:
        messages = Message.query.filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
                and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
            )
        ).order_by(Message.created_at.asc()).all()

        # Mark messages as read
        for message in messages:
            if message.recipient_id == current_user.id and not message.read_at:
                message.read_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'messages': [message.to_dict() for message in messages]}), 200

    except Exception as e:
        return jsonify({'message': f'Error getting conversation: {str(e)}'}), 500

# WebSocket event handlers
@socketio.on('join')
def on_join(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        join_room(room)
        emit('status', {'msg': f'User {user_id} has joined the room.'}, to=room)

@socketio.on('leave')
def on_leave(data):
    user_id = data.get('user_id')
    if user_id:
        room = f"user_{user_id}"
        leave_room(room)
        emit('status', {'msg': f'User {user_id} has left the room.'}, to=room)