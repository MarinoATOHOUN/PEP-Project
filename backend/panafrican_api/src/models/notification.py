from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # answer, message, badge, mentorship
    is_read = db.Column(db.Boolean, default=False)
    related_id = db.Column(db.Integer, nullable=True)  # ID de l'objet lié (question, message, etc.)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'related_id': self.related_id,
            'created_at': self.created_at.isoformat()
        }

class Opportunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # scholarship, competition, internship
    organization = db.Column(db.String(200), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    deadline = db.Column(db.DateTime, nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    link = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'organization': self.organization,
            'country': self.country,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'requirements': self.requirements,
            'link': self.link,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

