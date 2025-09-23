import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.questions import questions_bp
from src.routes.mentors import mentors_bp
from src.routes.badges import badges_bp
from src.routes.notifications import notifications_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Activer CORS pour toutes les routes
CORS(app)

# Enregistrer tous les blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(questions_bp, url_prefix='/api')
app.register_blueprint(mentors_bp, url_prefix='/api')
app.register_blueprint(badges_bp, url_prefix='/api')
app.register_blueprint(notifications_bp, url_prefix='/api')

# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Importer tous les modèles pour la création des tables
from src.models.question import Question, Answer
from src.models.mentor import Mentor, MentorshipRequest
from src.models.badge import Badge, UserBadge, UserPoints
from src.models.notification import Notification, Opportunity

with app.app_context():
    db.create_all()
    
    # Créer des badges par défaut si la table est vide
    if Badge.query.count() == 0:
        default_badges = [
            Badge(name="Premier pas", description="Première question posée", icon="🌟", 
                  criteria="Poser sa première question", points_required=0, category="contribution"),
            Badge(name="Contributeur", description="10 réponses données", icon="💡", 
                  criteria="Donner 10 réponses", points_required=100, category="contribution"),
            Badge(name="Expert", description="50 réponses données", icon="🎓", 
                  criteria="Donner 50 réponses", points_required=500, category="contribution"),
            Badge(name="Mentor débutant", description="Première session de mentorat", icon="🤝", 
                  criteria="Première session de mentorat", points_required=0, category="mentorship"),
            Badge(name="Mentor expérimenté", description="10 sessions de mentorat", icon="👨‍🏫", 
                  criteria="10 sessions de mentorat", points_required=200, category="mentorship"),
            Badge(name="Apprenant actif", description="10 questions posées", icon="📚", 
                  criteria="Poser 10 questions", points_required=50, category="learning")
        ]
        
        for badge in default_badges:
            db.session.add(badge)
        
        # Créer quelques opportunités par défaut
        default_opportunities = [
            Opportunity(
                title="Bourse d'excellence africaine 2024",
                description="Bourse pour étudiants africains en sciences et technologie",
                type="scholarship",
                organization="Union Africaine",
                country="Tous pays africains",
                requirements="Moyenne supérieure à 15/20, projet innovant",
                link="https://example.com/bourse-ua"
            ),
            Opportunity(
                title="Concours de programmation PanAfricain",
                description="Compétition de développement logiciel pour étudiants",
                type="competition",
                organization="TechAfrica",
                country="Tous pays africains",
                requirements="Étudiant en informatique, équipe de 2-4 personnes",
                link="https://example.com/concours-tech"
            )
        ]
        
        for opportunity in default_opportunities:
            db.session.add(opportunity)
        
        db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
