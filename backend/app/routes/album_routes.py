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

class AlbumDetailResource(Resource):

    @jwt_required()
    def get(self, album_id):
        user_id = get_jwt_identity()
        album = Album.query.get_or_404(album_id)

        if album.usuario_id != user_id:
            return {"message": "No autorizado"}, 403

        return {
            "id": album.id,
            "titulo": album.titulo,
            "descripcion": album.descripcion,
            "fecha_creacion": album.fecha_creacion.isoformat(),
            "fotos": [
                {"id": f.id, "titulo": f.titulo, "url": f.url}
                for f in album.fotos
            ]
        }, 200


    @jwt_required()
    def delete(self, album_id):
        user_id = get_jwt_identity()
        album = Album.query.get_or_404(album_id)

        if album.usuario_id != user_id:
            return {"message": "No tienes permiso para eliminar este álbum"}, 403

        db.session.delete(album)
        db.session.commit()
        return {"message": "Álbum eliminado"}, 200

    