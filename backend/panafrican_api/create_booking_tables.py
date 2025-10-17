"""
Script pour créer les tables de réservation de sessions.
Ce script peut être exécuté directement depuis le dossier `panafrican_api`.
"""

import os
import sys

# Ensure the package root is on sys.path when running this script directly
if os.path.basename(os.getcwd()) != 'panafrican_api':
    # Try to change to project directory if called from repo root
    try:
        repo_root = os.path.dirname(__file__)
        os.chdir(repo_root)
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from src import create_app, db


def create_tables():
    """Créer les nouvelles tables pour les réservations"""

    app = create_app()
    with app.app_context():
        print("🚀 Création des tables de réservation...\n")

        try:
            # Créer toutes les tables définies dans les modèles
            db.create_all()
            print("✅ Tables créées avec succès !")
            print("   - mentor_availability")
            print("   - mentor_session")

        except Exception as e:
            print(f"❌ Erreur lors de la création des tables: {str(e)}")
            raise


if __name__ == '__main__':
    create_tables()
