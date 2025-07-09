from flask_restful import Resource
from flask import request
from app.models.foto import Foto
from app.models.album import Album
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity


class FotoResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()

        album_id = data.get('album_id') 
        user_id = get_jwt_identity() 

        if album_id is not None:
            album = Album.query.get_or_404(album_id)
            album_id = album.id 

        foto = Foto(
            titulo=data['titulo'],
            url=data['url'],
            album_id=album_id,
            usuario_id=user_id 
        )
        db.session.add(foto)
        db.session.commit()

        return {"message": "Foto agregada", "foto_id": foto.id}, 201

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        fotos = Foto.query.filter_by(usuario_id=user_id).all()

        return [
            {
            "id": f.id, 
             "titulo": f.titulo, 
             "url": f.url, 
             "album_id": f.album_id
             }
            for f in fotos
        ], 200
