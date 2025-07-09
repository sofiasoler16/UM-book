from app.extensions import db
from datetime import datetime

class Foto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=False)  # En producción, esto sería un archivo
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow)

    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "url": self.url,
            "fecha_subida": self.fecha_subida.isoformat(),
            "album_id": self.album_id,
            "usuario_id": self.usuario_id,
        }
