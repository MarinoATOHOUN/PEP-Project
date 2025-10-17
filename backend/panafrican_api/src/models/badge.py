from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(200), nullable=False)
    criteria = db.Column(db.Text, nullable=False)  # JSON string des critères
    points_required = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # contribution, mentorship, learning
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'criteria': self.criteria,
            'points_required': self.points_required,
            'category': self.category,
            'created_at': self.created_at.isoformat()
        }

class UserBadge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    user = db.relationship('User', backref='user_badges')
    badge = db.relationship('Badge', backref='badge_users')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'badge_id': self.badge_id,
            'earned_at': self.earned_at.isoformat(),
            'badge': self.badge.to_dict()
        }

class UserPoints(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    total_points = db.Column(db.Integer, default=0)
    contribution_points = db.Column(db.Integer, default=0)
    mentorship_points = db.Column(db.Integer, default=0)
    learning_points = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation
    user = db.relationship('User', backref='points', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_points': self.total_points,
            'contribution_points': self.contribution_points,
            'mentorship_points': self.mentorship_points,
            'learning_points': self.learning_points,
            'updated_at': self.updated_at.isoformat()
        }

