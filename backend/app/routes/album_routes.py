from flask_restful import Resource
from flask import request
from app.models.album import Album
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

class AlbumResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()

        album = Album(titulo=data['titulo'], descripcion=data.get('descripcion', ''), usuario_id=user_id)
        db.session.add(album)
        db.session.commit()

        return {"message": "Álbum creado", "album_id": album.id}, 201

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        albums = Album.query.filter_by(usuario_id=user_id).all()
        return [{"id": a.id, "titulo": a.titulo, "descripcion": a.descripcion, "fecha_creacion": a.fecha_creacion.isoformat()} for a in albums], 200
