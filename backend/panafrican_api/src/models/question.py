from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    votes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relation avec les réponses
    answers = db.relationship('Answer', backref='question', lazy=True, cascade='all, delete-orphan')
    # Votes (par utilisateur)
    votes_rel = db.relationship('QuestionVote', backref='question', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        author = None
        if hasattr(self, 'author') and self.author:
            author = {
                'id': self.author.id,
                'username': self.author.username,
                'first_name': self.author.first_name,
                'last_name': self.author.last_name,
                'avatar': self.author.avatar
            }
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'subject': self.subject,
            'level': self.level,
            'country': self.country,
            'votes': self.votes,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id,
            'author': author,
            'answers_count': len(self.answers)
        }

class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    votes = db.Column(db.Integer, default=0)
    is_accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    
    def to_dict(self):
        author = None
        if hasattr(self, 'author') and self.author:
            author = {
                'id': self.author.id,
                'username': self.author.username,
                'first_name': self.author.first_name,
                'last_name': self.author.last_name,
                'avatar': self.author.avatar
            }
        return {
            'id': self.id,
            'content': self.content,
            'votes': self.votes,
            'is_accepted': self.is_accepted,
            'created_at': self.created_at.isoformat(),
            'user_id': self.user_id,
            'question_id': self.question_id,
            'author': author
        }

# Vote model pour les questions (pour enregistrer qui a liké)
class QuestionVote(db.Model):
    __tablename__ = 'question_vote'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    is_up = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'question_id', name='uix_user_question_vote'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'question_id': self.question_id,
            'is_up': self.is_up,
            'created_at': self.created_at.isoformat()
        }

