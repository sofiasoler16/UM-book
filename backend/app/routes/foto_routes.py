from flask_restful import Resource
from flask import request
from app.models.foto import Foto
from app.models.album import Album
from app.extensions import db
from flask_jwt_extended import jwt_required

class FotoResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        album = Album.query.get_or_404(data['album_id'])

        foto = Foto(
            titulo=data['titulo'],
            url=data['url'],
            album_id=album.id
        )
        db.session.add(foto)
        db.session.commit()

        return {"message": "Foto agregada", "foto_id": foto.id}, 201

    @jwt_required()
    def get(self):
        fotos = Foto.query.all()
        return [
            {"id": f.id, "titulo": f.titulo, "url": f.url, "album_id": f.album_id}
            for f in fotos
        ], 200
