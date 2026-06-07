from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import sqlite3
import hashlib
from database import init_db

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'interntrack-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
CORS(app, origins="*")
jwt = JWTManager(app)
init_db()

def get_db():
    conn = sqlite3.connect('interntrack.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def health():
    return jsonify({'message': 'Backend is running!'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        if not name or not email or not password:
            return jsonify({'message': 'Missing required fields'}), 422
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        conn = get_db()
        conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                     (name, email, password_hash, role))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully!'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': 'Email already exists!'}), 400
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 422
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE email = ? AND password = ?',
                            (email, password_hash)).fetchone()
        conn.close()
        if user:
            token = create_access_token(
                identity=str(user['id']),
                additional_claims={'id': user['id'], 'role': user['role'], 'name': user['name']}
            )
            return jsonify({'token': token, 'role': user['role'], 'name': user['name']}), 200
        return jsonify({'message': 'Invalid credentials!'}), 401
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    claims = get_jwt()
    return jsonify({'id': claims.get('id'), 'role': claims.get('role'), 'name': claims.get('name')}), 200

@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    conn = get_db()
    opportunities = conn.execute('SELECT * FROM opportunities').fetchall()
    conn.close()
    return jsonify([dict(row) for row in opportunities]), 200

@app.route('/api/opportunities', methods=['POST'])
@jwt_required()
def post_opportunity():
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['faculty', 'admin']:
        return jsonify({'message': 'Unauthorized!'}), 403
    data = request.get_json()
    conn = get_db()
    conn.execute('INSERT INTO opportunities (title, company, stipend, deadline, description, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
                 (data['title'], data['company'], data.get('stipend', ''), data.get('deadline', ''), data['description'], claims.get('id')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Opportunity posted!'}), 201

@app.route('/api/apply', methods=['POST'])
@jwt_required()
def apply():
    claims = get_jwt()
    user_id = claims.get('id')
    data = request.get_json()
    conn = get_db()
    existing = conn.execute('SELECT * FROM applications WHERE user_id = ? AND opportunity_id = ?',
                            (user_id, data['opportunity_id'])).fetchone()
    if existing:
        conn.close()
        return jsonify({'message': 'Already applied!'}), 400
    conn.execute('INSERT INTO applications (user_id, opportunity_id) VALUES (?, ?)',
                 (user_id, data['opportunity_id']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Applied successfully!'}), 201

@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_applications():
    claims = get_jwt()
    user_id = claims.get('id')
    conn = get_db()
    apps = conn.execute('''
        SELECT a.id, a.status, o.title, o.company, o.stipend, o.deadline
        FROM applications a
        JOIN opportunities o ON a.opportunity_id = o.id
        WHERE a.user_id = ?
    ''', (user_id,)).fetchall()
    conn.close()
    return jsonify([dict(row) for row in apps]), 200

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_status(app_id):
    data = request.get_json()
    conn = get_db()
    conn.execute('UPDATE applications SET status = ? WHERE id = ?',
                 (data['status'], app_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Status updated!'}), 200

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    claims = get_jwt()
    user_id = claims.get('id')
    role = claims.get('role')
    
    conn = get_db()
    
    # Global stats
    total_opportunities = conn.execute('SELECT COUNT(*) FROM opportunities').fetchone()[0]
    total_applications = conn.execute('SELECT COUNT(*) FROM applications').fetchone()[0]
    total_offers = conn.execute("SELECT COUNT(*) FROM applications WHERE status = 'Offer'").fetchone()[0]
    total_rejected = conn.execute("SELECT COUNT(*) FROM applications WHERE status = 'Rejected'").fetchone()[0]
    total_pending = conn.execute("SELECT COUNT(*) FROM applications WHERE status = 'Pending' OR status IS NULL").fetchone()[0]
    
    # Acceptance rate
    acceptance_rate = round((total_offers / total_applications * 100) if total_applications > 0 else 0, 2)
    
    # Companies data
    companies = conn.execute('''
        SELECT o.company, COUNT(a.id) as applicants, COUNT(CASE WHEN a.status = 'Offer' THEN 1 END) as offers
        FROM opportunities o
        LEFT JOIN applications a ON o.id = a.opportunity_id
        GROUP BY o.company
    ''').fetchall()
    
    # Student-specific stats (if user is a student)
    student_stats = {}
    if role == 'student':
        student_apps = conn.execute('SELECT COUNT(*) FROM applications WHERE user_id = ?', (user_id,)).fetchone()[0]
        student_offers = conn.execute("SELECT COUNT(*) FROM applications WHERE user_id = ? AND status = 'Offer'", (user_id,)).fetchone()[0]
        student_rejected = conn.execute("SELECT COUNT(*) FROM applications WHERE user_id = ? AND status = 'Rejected'", (user_id,)).fetchone()[0]
        student_pending = conn.execute("SELECT COUNT(*) FROM applications WHERE user_id = ? AND (status = 'Pending' OR status IS NULL)", (user_id,)).fetchone()[0]
        student_stats = {
            'applications': student_apps,
            'offers': student_offers,
            'rejected': student_rejected,
            'pending': student_pending,
            'acceptance_rate': round((student_offers / student_apps * 100) if student_apps > 0 else 0, 2)
        }
    
    conn.close()
    return jsonify({
        'total_opportunities': total_opportunities,
        'total_applications': total_applications,
        'total_offers': total_offers,
        'total_rejected': total_rejected,
        'total_pending': total_pending,
        'acceptance_rate': acceptance_rate,
        'companies': [dict(row) for row in companies],
        'student_stats': student_stats if role == 'student' else None
    }), 200

@app.route('/api/all-applications', methods=['GET'])
@jwt_required()
def get_all_applications():
    claims = get_jwt()
    role = claims.get('role')
    if role not in ['faculty', 'admin']:
        return jsonify({'message': 'Unauthorized!'}), 403
    conn = get_db()
    apps = conn.execute('''
        SELECT a.id, a.status, u.name as student_name, u.email,
               o.title, o.company
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN opportunities o ON a.opportunity_id = o.id
        ORDER BY o.company
    ''').fetchall()
    conn.close()
    return jsonify([dict(row) for row in apps]), 200

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    claims = get_jwt()
    user_id = claims.get('id')
    conn = get_db()
    user = conn.execute('SELECT id, name, email, role FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user:
        return jsonify(dict(user)), 200
    return jsonify({'message': 'User not found'}), 404

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    claims = get_jwt()
    user_id = claims.get('id')
    data = request.get_json()
    conn = get_db()
    try:
        conn.execute('UPDATE users SET name = ?, email = ? WHERE id = ?',
                     (data['name'], data['email'], user_id))
        conn.commit()
        user = conn.execute('SELECT id, name, email, role FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        return jsonify(dict(user)), 200
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'Email already exists!'}), 400
    except Exception as e:
        conn.close()
        return jsonify({'message': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)