"""
Script pour initialiser les disponibilités des mentors.
Can be run directly from the `panafrican_api` folder.
"""

import os
import sys

# Ensure the package root is on sys.path when running this script directly
if os.path.basename(os.getcwd()) != 'panafrican_api':
    try:
        repo_root = os.path.dirname(__file__)
        os.chdir(repo_root)
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src import create_app
from src.models.mentor import Mentor, MentorAvailability
from src import db
from datetime import time


def init_default_availabilities():
    """Ajoute des disponibilités par défaut pour tous les mentors"""

    app = create_app()
    with app.app_context():
        # Import all model modules so SQLAlchemy mapper registry knows every class
        # (prevents errors where relationships reference classes not yet loaded)
        from src.models.user import User
        from src.models.question import Question, Answer
        from src.models.badge import Badge, UserBadge, UserPoints
        from src.models.notification import Notification, Opportunity

        mentors = Mentor.query.all()

        if not mentors:
            print("❌ Aucun mentor trouvé dans la base de données")
            return

        print(f"✅ {len(mentors)} mentor(s) trouvé(s)")

        for mentor in mentors:
            # Vérifier si le mentor a déjà des disponibilités
            existing = MentorAvailability.query.filter_by(mentor_id=mentor.id).first()

            if existing:
                if getattr(mentor, 'user', None):
                    print(f"⏭️  Le mentor {mentor.user.first_name} {mentor.user.last_name} a déjà des disponibilités")
                else:
                    print(f"⏭️  Le mentor id={mentor.id} (user_id={mentor.user_id}) a déjà des disponibilités (utilisateur introuvable)")
                continue

            # Créer des disponibilités par défaut
            default_schedule = [
                {'day': 0, 'start': time(9, 0), 'end': time(12, 0)},
                {'day': 0, 'start': time(14, 0), 'end': time(18, 0)},
                {'day': 1, 'start': time(9, 0), 'end': time(12, 0)},
                {'day': 1, 'start': time(14, 0), 'end': time(18, 0)},
                {'day': 2, 'start': time(9, 0), 'end': time(12, 0)},
                {'day': 2, 'start': time(14, 0), 'end': time(18, 0)},
                {'day': 3, 'start': time(9, 0), 'end': time(12, 0)},
                {'day': 3, 'start': time(14, 0), 'end': time(18, 0)},
                {'day': 4, 'start': time(9, 0), 'end': time(12, 0)},
                {'day': 4, 'start': time(14, 0), 'end': time(18, 0)},
            ]

            for schedule in default_schedule:
                availability = MentorAvailability(
                    mentor_id=mentor.id,
                    day_of_week=schedule['day'],
                    start_time=schedule['start'],
                    end_time=schedule['end'],
                    is_active=True
                )
                db.session.add(availability)

            if getattr(mentor, 'user', None):
                print(f"✅ Disponibilités créées pour {mentor.user.first_name} {mentor.user.last_name}")
            else:
                print(f"✅ Disponibilités créées pour mentor id={mentor.id} (user_id={mentor.user_id}) — utilisateur introuvable")

        db.session.commit()
        print("\n✅ Initialisation terminée avec succès !")


if __name__ == '__main__':
    print("🚀 Initialisation des disponibilités des mentors...\n")
    init_default_availabilities()
