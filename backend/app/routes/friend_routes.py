from flask_restful import Resource
from flask import request
from app.extensions import db
from app.models.friend_request import FriendRequest
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

        if friend_request.receiver_id != user_id:
            return {'message': 'No tienes permiso para confirmar esta solicitud.'}, 403

        data = request.get_json()
        action = data.get('action')

        if action == 'accept':
            # Cambiar estado
            friend_request.status = 'accepted'

            # Crear amistad bidireccional
            db.session.add(Friendship(user_id=friend_request.receiver_id, friend_id=friend_request.sender_id))
            db.session.add(Friendship(user_id=friend_request.sender_id, friend_id=friend_request.receiver_id))
            db.session.commit()
            return {'message': 'Solicitud aceptada y amistad creada.'}, 200

        elif action == 'reject':
            # Rechazar o eliminar directamente
            db.session.delete(friend_request)  # o simplemente cambiar a 'rejected'
            db.session.commit()
            return {'message': 'Solicitud rechazada y eliminada.'}, 200

        return {'message': 'Acción inválida.'}, 400

class FriendsListResource(Resource):
    @jwt_required()
    def get(self):
        user_id = int(get_jwt_identity())
        friendships = Friendship.query.filter_by(user_id=user_id).all()

        return [
            {
                'friend_id': f.friend_id,
                'friend_username': f.friend.username
            } for f in friendships
        ], 200
