from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'interntrack-secret-key'
CORS(app)

@app.route('/')
def home():
    return {"message": "InternTrack API Running!"}

if __name__ == '__main__':
    app.run(debug=True)