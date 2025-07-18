from flask import request
from flask_restful import Resource
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password_hash, password):
            return {"message": "Usuario o contraseña incorrectos"}, 401

        access_token = create_access_token(identity=str(user.id))



        return {"access_token": access_token}, 200
