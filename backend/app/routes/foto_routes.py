from flask_restful import Resource
from flask import request
from app.models.foto import Foto
from app.models.album import Album
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.friendship import Friendship

# ------------------------------
# PUBLICACIÓN INDIVIDUAL
# ------------------------------

class FotoResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        album_id = data.get('album_id')
        user_id = get_jwt_identity()

        if album_id is not None:
            album = Album.query.get_or_404(album_id)

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
            } for f in fotos
        ], 200

# ------------------------------
# FOTOS DE AMIGOS
# ------------------------------

class FotoAmigosResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()

        amigos = Friendship.query.filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id))
        ).all()

        amigos_ids = set()
        for a in amigos:
            if a.user_id == user_id:
                amigos_ids.add(a.friend_id)
            elif a.friend_id == user_id:
                amigos_ids.add(a.user_id)

        fotos_amigos = Foto.query.filter(Foto.usuario_id.in_(amigos_ids)).all()

        return [
            {
                "id": f.id,
                "titulo": f.titulo,
                "url": f.url,
                "usuario_id": f.usuario_id,
                "album_id": f.album_id
            } for f in fotos_amigos
        ], 200

# ------------------------------
# FOTOS DE UN USUARIO
# ------------------------------

class FotosPorUsuarioResource(Resource):
    @jwt_required()
    def get(self, usuario_id):
        fotos = Foto.query.filter_by(usuario_id=usuario_id).all()
        return [
            {
                "id": f.id,
                "titulo": f.titulo,
                "url": f.url,
                "usuario_id": f.usuario_id,
                "album_id": f.album_id
            } for f in fotos
        ], 200

# ------------------------------
# ALBUMES DE AMIGOS
# ------------------------------

class AlbumAmigosResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()

        amistades = Friendship.query.filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id))
        ).all()

        amigos_ids = set()
        for a in amistades:
            if a.user_id == user_id:
                amigos_ids.add(a.friend_id)
            else:
                amigos_ids.add(a.user_id)

        albums = Album.query.filter(Album.usuario_id.in_(amigos_ids)).all()

        resultado = []
        for album in albums:
            usuario = User.query.get(album.usuario_id)
            fotos = Foto.query.filter_by(album_id=album.id).all()
            resultado.append({
                "id": album.id,
                "nombre": album.titulo,
                "fecha": album.fecha_creacion.strftime('%d/%m/%Y') if album.fecha_creacion else "Fecha desconocida",
                "username": usuario.username if usuario else "desconocido",
                "imagenes": [f.url for f in fotos]
            })

        return resultado, 200

# ------------------------------
# ALBUMES DEL USUARIO
# ------------------------------

class AlbumUsuarioResource(Resource):
    @jwt_required()
    def get(self, usuario_id):
        albums = Album.query.filter_by(usuario_id=usuario_id).all()
        resultado = []
        for album in albums:
            fotos = Foto.query.filter_by(album_id=album.id).all()
            resultado.append({
                "id": album.id,
                "nombre": album.titulo,
                "descripcion": album.descripcion,
                "fecha_creacion": album.fecha_creacion.isoformat(),
                "imagenes": [{"url": f.url, "titulo": f.titulo} for f in fotos]
            })
        return resultado, 200

# ------------------------------
# CREAR ÁLBUM CON FOTOS
# ------------------------------

class CrearAlbumResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()

        album = Album(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            usuario_id=user_id
        )
        db.session.add(album)
        db.session.flush()  # para obtener el ID antes del commit

        for foto in data.get('fotos', []):
            nueva_foto = Foto(
                titulo=foto['titulo'],
                url=foto['url'],
                usuario_id=user_id,
                album_id=album.id
            )
            db.session.add(nueva_foto)

        db.session.commit()

        return {"message": "Álbum creado exitosamente", "album_id": album.id}, 201
class FotosPorUsuarioResource(Resource):
    @jwt_required()
    def get(self, usuario_id):
        fotos = Foto.query.filter_by(usuario_id=usuario_id).all()
        return [
            {
                "id": f.id,
                "titulo": f.titulo,
                "url": f.url,
                "usuario_id": f.usuario_id,
                "album_id": f.album_id,
                "fecha": f.fecha_subida.strftime('%d/%m/%Y') if f.fecha_subida else 'Desconocida'
            } for f in fotos
        ], 200
