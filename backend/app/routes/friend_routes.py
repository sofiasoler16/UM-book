from operator import or_
from flask_restful import Resource
from flask import request
from app.extensions import db
from app.models.friend_request import FriendRequest, FriendRequestStateContext
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.friendship import Friendship



class SendFriendRequestResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        sender_id = get_jwt_identity()
        receiver_id = data.get('receiver_id')

        if sender_id == receiver_id:
            return {'message': 'No puedes enviarte una solicitud a ti mismo.'}, 400

        # 🚫 Verificar si ya son amigos
        ya_son_amigos = Friendship.query.filter(
            ((Friendship.user_id == sender_id) & (Friendship.friend_id == receiver_id)) |
            ((Friendship.user_id == receiver_id) & (Friendship.friend_id == sender_id))
        ).first()

        if ya_son_amigos:
            return {'message': 'Ya sos amigo de este usuario.'}, 400

        # 🚫 Verifica si ya existe una solicitud pendiente
        existing = FriendRequest.query.filter_by(sender_id=sender_id, receiver_id=receiver_id, status='pending').first()
        if existing:
            return {'message': 'Ya enviaste una solicitud a este usuario.'}, 400

        # ✅ Crear nueva solicitud
        friend_request = FriendRequest(sender_id=sender_id, receiver_id=receiver_id)
        db.session.add(friend_request)
        db.session.commit()

        return {'message': 'Solicitud enviada correctamente.'}, 201



class ReceivedFriendRequestsResource(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())

        requests = FriendRequest.query.filter_by(receiver_id=user_id, status='pending').all()

        result = []
        for r in requests:
            result.append({
                'id': r.id,
                'sender_id': r.sender_id,
                'sender_username': r.sender.username,
                'status': r.status,
                'timestamp': r.timestamp.isoformat()
            })

        return result, 200


class ConfirmFriendRequestResource(Resource):
    @jwt_required()
    def put(self, request_id):
        user_id = int(get_jwt_identity())
        friend_request = FriendRequest.query.get_or_404(request_id)

        # Crear el contexto del estado para la solicitud
        request_context = FriendRequestStateContext(friend_request)

        # Verificar permisos
        if friend_request.receiver_id != user_id:
            return {'message': 'No tienes permiso para confirmar esta solicitud.'}, 403

        data = request.get_json()
        action = data.get('action')

        if action == 'accept':
            # Delegar la acción al estado actual
            response, status_code = request_context.accept_request()
            if status_code == 200: # Si la acción fue exitosa por el estado
                # Lógica para crear la amistad, ya que el estado solo maneja la transición del request
                user1 = min(friend_request.sender_id, friend_request.receiver_id)
                user2 = max(friend_request.sender_id, friend_request.receiver_id)

                existing_friendship = Friendship.query.filter_by(user_id=user1, friend_id=user2).first()
                if not existing_friendship:
                    db.session.add(Friendship(user_id=user1, friend_id=user2))
                db.session.commit() # Commit de los cambios del request y la amistad
                return {'message': 'Solicitud aceptada y amistad creada.'}, 200
            else:
                db.session.rollback() # Si el estado devuelve un error (ej. ya aceptada)
                return response, status_code # Devolver el error del estado

        elif action == 'reject':
            response, status_code = request_context.reject_request()
            if status_code == 200: # Si la acción fue exitosa por el estado
                # Lógica para eliminar la solicitud (si el estado cambió a 'rejected')
                db.session.delete(friend_request)
                db.session.commit() # Commit de la eliminación del request
                return {'message': 'Solicitud rechazada y eliminada.'}, 200
            else:
                db.session.rollback() # Si el estado devuelve un error (ej. ya rechazada)
                return response, status_code # Devolver el error del estado

        return {'message': 'Acción inválida.'}, 400


class FriendsListResource(Resource):
    @jwt_required()
    def get(self):
        current_user_id = int(get_jwt_identity())

        friendships = Friendship.query.filter(
            or_(
                Friendship.user_id == current_user_id,
                Friendship.friend_id == current_user_id
            )
        ).all()

        amigos = []
        for f in friendships:
            if f.user_id == current_user_id:
                amigo = f.friend
            else:
                amigo = f.user
            amigos.append({
                'friend_id': amigo.id,
                'friend_username': amigo.username
            })

        return amigos, 200
    
class DeleteFriendResource(Resource):
    method_decorators = [jwt_required()]  # Aplica a todos los métodos (excepto options)

    def delete(self, friend_id):
        current_user_id = get_jwt_identity()

        friendship = Friendship.query.filter(
            db.or_(
                db.and_(Friendship.user_id == current_user_id, Friendship.friend_id == friend_id),
                db.and_(Friendship.user_id == friend_id, Friendship.friend_id == current_user_id)
            )
        ).first()

        if not friendship:
            return {'message': 'Amistad no encontrada'}, 404

        db.session.delete(friendship)
        db.session.commit()
        return {'message': 'Amistad eliminada correctamente'}, 200

    def options(self, friend_id=None):
        """Habilita preflight CORS"""
        return {}, 200




class FriendsListResource(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())

        friendships = Friendship.query.filter(
            (Friendship.user_id == user_id) | (Friendship.friend_id == user_id)
        ).all()

        result = []
        added_ids = set()

        for f in friendships:
            # Determinar el amigo real (el otro que no soy yo)
            if f.user_id == user_id:
                friend_id = f.friend_id
                friend_username = f.friend.username
            else:
                friend_id = f.user_id
                friend_username = f.user.username

            # Evitar duplicados
            if friend_id not in added_ids:
                result.append({
                    'friend_id': friend_id,
                    'friend_username': friend_username
                })
                added_ids.add(friend_id)

        return result, 200

