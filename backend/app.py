from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import sqlite3
import hashlib
from database import init_db

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'interntrack-secret-key'
CORS(app, origins="*")
jwt = JWTManager(app)

init_db()

def get_db():
    conn = sqlite3.connect('interntrack.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = hashlib.sha256(data.get('password').encode()).hexdigest()
    role = data.get('role', 'student')
    try:
        conn = get_db()
        conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                     (name, email, password, role))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already exists!'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = hashlib.sha256(data.get('password').encode()).hexdigest()
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?',
                        (email, password)).fetchone()
    conn.close()
    if user:
        token = create_access_token(identity={'id': user['id'], 'role': user['role'], 'name': user['name']})
        return jsonify({'token': token, 'role': user['role'], 'name': user['name']}), 200
    return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    user = get_jwt_identity()
    return jsonify(user), 200

if __name__ == '__main__':
    app.run(debug=True)