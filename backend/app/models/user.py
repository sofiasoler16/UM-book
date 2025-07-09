from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')  # user o admin
    fecha_nacimiento = db.Column(db.Date, nullable=False)

    # Relaciones 
    albums = db.relationship('Album', backref='usuario', cascade="all, delete-orphan", lazy=True)
    fotos = db.relationship('Foto', backref='usuario', cascade="all, delete-orphan", lazy=True)


    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "fecha_nacimiento": str(self.fecha_nacimiento)
        }
