from flask import Blueprint, request, jsonify, current_app
from ..models.user import db, User
from ..models.badge import UserPoints
from sqlalchemy.exc import IntegrityError
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# Clé secrète pour JWT (à changer en production)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token manquant'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'Utilisateur non trouvé'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expiré'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token invalide'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Vérification des champs requis
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Champ {field} requis'}), 400
        
        # Vérifier si l'utilisateur existe déjà
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Nom d\'utilisateur déjà pris'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email déjà utilisé'}), 400
        
        # Créer nouvel utilisateur
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            country=data['country'],
            education_level=data.get('education_level'),
            institution=data.get('institution'),
            bio=data.get('bio')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Créer les points utilisateur si nécessaire (prévenir INSERT en double)
        existing_points = UserPoints.query.filter_by(user_id=user.id).first()
        if not existing_points:
            try:
                user_points = UserPoints(user_id=user.id)
                db.session.add(user_points)
                db.session.commit()
            except IntegrityError:
                # Une autre transaction a peut-être créé la ligne en parallèle.
                db.session.rollback()
                user_points = UserPoints.query.filter_by(user_id=user.id).first()
        else:
            user_points = existing_points
        
        return jsonify({
            'message': 'Utilisateur créé avec succès',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de l\'inscription: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Nom d\'utilisateur et mot de passe requis'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            # Mettre à jour la dernière connexion
            user.last_login = datetime.datetime.utcnow()
            db.session.commit()
            
            # Générer le token JWT
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, current_app.config['SECRET_KEY'], algorithm='HS256')
            
            return jsonify({
                'message': 'Connexion réussie',
                'token': token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'message': 'Identifiants invalides'}), 401
            
    except Exception as e:
        return jsonify({'message': f'Erreur lors de la connexion: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        
        # Mettre à jour les champs modifiables
        updatable_fields = ['first_name', 'last_name', 'bio', 'education_level', 'institution', 'avatar']
        for field in updatable_fields:
            if field in data:
                setattr(current_user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profil mis à jour avec succès',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Erreur lors de la mise à jour: {str(e)}'}), 500

