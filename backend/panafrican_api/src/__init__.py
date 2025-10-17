"""
Initialize the panafrican_api package
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from .models.user import db

__version__ = '0.1.0'

# Use eventlet for async mode (if available) to support real WebSocket upgrades.
socketio = SocketIO(async_mode='eventlet', cors_allowed_origins="*")

def create_app():
    app = Flask(__name__, static_folder='static')
    app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
    # Use an absolute path for the SQLite file so scripts with different
    # current working directories can open the DB reliably.
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_dir = os.path.join(base_dir, 'database')
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Allow CORS for API endpoints; be explicit about allowed methods and headers
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True, allow_headers="*", expose_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    db.init_app(app)
    # socketio already configured with cors_allowed_origins; just init with app
    socketio.init_app(app)

    # Create tables if they don't exist and import models so mappers are registered
    # Wrap in try/except: if table creation fails we still want the app to start
    # so that CORS preflight and other endpoints can respond (helps debugging).
    with app.app_context():
        try:
            import logging
            logging.getLogger().info('SQLAlchemy metadata before create_all: %s', list(db.metadata.tables.keys()))
            # Import all model modules so SQLAlchemy registers every table and
            # foreign key relationships before creating tables.
            from .models.user import User
            from .models.message import Message
            from .models.question import Question, Answer, QuestionVote
            from .models.mentor import Mentor, MentorshipRequest, MentorAvailability, MentorSession
            from .models.badge import Badge, UserBadge, UserPoints
            from .models.notification import Notification, Opportunity
        # Table creation is handled by management scripts (create_booking_tables.py)
        # to avoid startup-time issues when models have interdependencies.
        except Exception as e:
            # Log the error but don't prevent app from starting.
            import logging
            logging.exception('Failed to create tables at startup: %s', e)

    # Register API blueprints here to expose endpoints under /api
    from .routes.auth import auth_bp
    from .routes.questions import questions_bp
    from .routes.mentors import mentors_bp
    from .routes.messages import messages_bp
    from .routes.user import user_bp
    from .routes.badges import badges_bp
    from .routes.notifications import notifications_bp
    from .routes.stats import stats_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(questions_bp, url_prefix='/api')
    app.register_blueprint(mentors_bp, url_prefix='/api')
    app.register_blueprint(messages_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(badges_bp, url_prefix='/api')
    app.register_blueprint(notifications_bp, url_prefix='/api')
    app.register_blueprint(stats_bp, url_prefix='/api')

    # Ensure Access-Control headers are present for all responses (safe fallback)
    @app.after_request
    def add_cors_headers(response):
        response.headers.setdefault('Access-Control-Allow-Origin', '*')
        response.headers.setdefault('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        response.headers.setdefault('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        return response

    return app
