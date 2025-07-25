# app/models/friend_request.py

from app.extensions import db
from datetime import datetime
from abc import ABC, abstractmethod

# --- Interfaz de Estado ---
class FriendRequestState(ABC):
    @abstractmethod
    def accept(self, request_context):
        pass

    @abstractmethod
    def reject(self, request_context):
        pass

    @abstractmethod
    def get_status(self):
        pass

# --- Estados Concretos ---
class PendingState(FriendRequestState):
    def accept(self, request_context):
        request_context.request.status = 'accepted'
        request_context.transition_to(AcceptedState())
        # Aquí se podría añadir la lógica para crear la amistad si fuera solo responsabilidad del estado
        # Pero por ahora la dejaremos en el recurso Flask para mayor claridad del diagrama
        return {'message': 'Solicitud aceptada. Se procederá a crear la amistad.'}, 200

    def reject(self, request_context):
        request_context.request.status = 'rejected'
        request_context.transition_to(RejectedState())
        # Aquí se podría añadir la lógica para eliminar la solicitud si fuera solo responsabilidad del estado
        return {'message': 'Solicitud rechazada.'}, 200

    def get_status(self):
        return 'pending'

class AcceptedState(FriendRequestState):
    def accept(self, request_context):
        return {'message': 'La solicitud ya ha sido aceptada.'}, 400

    def reject(self, request_context):
        return {'message': 'No se puede rechazar una solicitud ya aceptada.'}, 400

    def get_status(self):
        return 'accepted'

class RejectedState(FriendRequestState):
    def accept(self, request_context):
        return {'message': 'No se puede aceptar una solicitud ya rechazada.'}, 400

    def reject(self, request_context):
        return {'message': 'La solicitud ya ha sido rechazada.'}, 400

    def get_status(self):
        return 'rejected'

# --- Contexto ---
class FriendRequestStateContext:
    def __init__(self, request_instance):
        self._request = request_instance
        self._state = self._get_initial_state(request_instance.status)

    def _get_initial_state(self, status):
        if status == 'pending':
            return PendingState()
        elif status == 'accepted':
            return AcceptedState()
        elif status == 'rejected':
            return RejectedState()
        else:
            raise ValueError("Estado de solicitud de amistad inválido.")

    def transition_to(self, state: FriendRequestState):
        self._state = state
        self._request.status = state.get_status() # Sincronizar el estado del modelo

    @property
    def request(self):
        return self._request

    def accept_request(self):
        return self._state.accept(self)

    def reject_request(self):
        return self._state.reject(self)

    def get_current_status(self):
        return self._state.get_status()


# --- Modelo ORM (sin cambios significativos en la estructura) ---
class FriendRequest(db.Model):
    __tablename__ = 'friend_requests'

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_requests')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'status': self.status,
            'timestamp': self.timestamp.isoformat()
        }