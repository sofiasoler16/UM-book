from flask_restful import Resource
from flask import request, jsonify
from app.models.user import User
from app.extensions import db
from datetime import datetime
from flask_jwt_extended import jwt_required


class UserResource(Resource):
    def get(self):
        users = User.query.all()
        return [user.to_dict() for user in users], 200

    def post(self):
        data = request.get_json()

        if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
            return {"message": "El usuario o el email ya están registrados."}, 400

        user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            username=data['username'],
            email=data['email'],
            fecha_nacimiento=datetime.fromisoformat(data['fecha_nacimiento']).date()

        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return user.to_dict(), 201
