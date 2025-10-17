import os

class Config:
    """Base configuration."""
    # Clés secrètes et sécurité
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'asdf#FGSgvasgf$5$WGT'
    JWT_SECRET = os.environ.get('JWT_SECRET') or 'asdf#FGSgvasgf$5$WGT'
    
    # Configuration de la base de données
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'database', 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuration CORS
    CORS_HEADERS = 'Content-Type'