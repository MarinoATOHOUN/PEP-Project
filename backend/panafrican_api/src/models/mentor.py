from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from .user import db
import json

class Mentor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
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
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
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

# Modèle pour les disponibilités des mentors
class MentorAvailability(db.Model):
    __tablename__ = 'mentor_availability'
    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Lundi, 6=Dimanche
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relation
    mentor = db.relationship('Mentor', backref='availabilities')
    
    def to_dict(self):
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'day_of_week': self.day_of_week,
            'day_name': ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][self.day_of_week],
            'start_time': self.start_time.strftime('%H:%M'),
            'end_time': self.end_time.strftime('%H:%M'),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

# Modèle pour les sessions réservées
class MentorSession(db.Model):
    __tablename__ = 'mentor_session'
    id = db.Column(db.Integer, primary_key=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentor.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    session_date = db.Column(db.DateTime, nullable=False)  # Date et heure de début
    duration_minutes = db.Column(db.Integer, default=60)  # Durée en minutes
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled, no_show
    meeting_link = db.Column(db.String(500), nullable=True)  # Lien de visio
    notes = db.Column(db.Text, nullable=True)  # Notes de la session
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    mentor = db.relationship('Mentor', backref='sessions')
    student = db.relationship('User', foreign_keys=[student_id], backref='mentor_sessions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'student_id': self.student_id,
            'session_date': self.session_date.isoformat(),
            'end_date': (self.session_date + timedelta(minutes=self.duration_minutes)).isoformat(),
            'duration_minutes': self.duration_minutes,
            'subject': self.subject,
            'description': self.description,
            'status': self.status,
            'meeting_link': self.meeting_link,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

