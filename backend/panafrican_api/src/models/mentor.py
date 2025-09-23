from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Mentor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    specialties = db.Column(db.Text, nullable=False)  # JSON string des spécialités
    experience_years = db.Column(db.Integer, nullable=False)
    education_level = db.Column(db.String(100), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, default=0.0)
    total_sessions = db.Column(db.Integer, default=0)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation avec l'utilisateur
    user = db.relationship('User', backref='mentor_profile', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialties': self.specialties,
            'experience_years': self.experience_years,
            'education_level': self.education_level,
            'institution': self.institution,
            'bio': self.bio,
            'rating': self.rating,
            'total_sessions': self.total_sessions,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat()
        }

class MentorshipRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, completed
    requested_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relations
    student = db.relationship('User', foreign_keys=[student_id], backref='mentorship_requests')
    mentor = db.relationship('Mentor', backref='requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'mentor_id': self.mentor_id,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'requested_date': self.requested_date.isoformat() if self.requested_date else None,
            'created_at': self.created_at.isoformat()
        }

