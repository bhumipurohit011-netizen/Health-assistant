"""
HealthAI Symptom Checker & Diagnosis Assistant
Flask Backend API Server
"""

import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import database
import diagnosis

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'healthai_secure_session_key_2026')
CORS(app, supports_credentials=True)

# Initialize SQLite database
with app.app_context():
    database.init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'online', 'service': 'HealthAI Assistant'})

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    full_name = data.get('fullName', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not full_name or not email or not password:
        return jsonify({'error': 'Please provide full name, email, and password.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    user = database.create_user(full_name, email, password)
    if not user:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    session['user_id'] = user['id']
    return jsonify({'success': True, 'user': user}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email_or_name = data.get('email', '').strip()
    password = data.get('password', '')

    if not email_or_name or not password:
        return jsonify({'error': 'Please provide email/username and password.'}), 400

    user = database.authenticate_user(email_or_name, password)
    if not user:
        return jsonify({'error': 'Invalid email/username or password.'}), 401

    session['user_id'] = user['id']
    return jsonify({'success': True, 'user': user})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully.'})

@app.route('/api/profile', methods=['GET', 'PUT'])
def user_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        user = database.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user})

    data = request.get_json() or {}
    database.update_user_preferences(user_id, data.get('preferences', {}))
    return jsonify({'success': True, 'preferences': data.get('preferences')})

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Intelligent symptom chat endpoint.
    Extracts symptoms, checks emergencies, returns follow-ups or analysis.
    """
    data = request.get_json() or {}
    message_text = data.get('text', '').strip()
    known_symptoms = data.get('knownSymptoms', [])
    asked_symptoms = data.get('askedSymptoms', [])
    turn_count = data.get('turnCount', 0)

    if not message_text:
        return jsonify({'error': 'Message text is required.'}), 400

    # 1. Emergency safety check
    emg = diagnosis.detect_emergency(message_text)
    if emg['is_emergency']:
        return jsonify({
            'is_emergency': True,
            'matched_phrase': emg['matched_phrase'],
            'reply': f"⚠️ Emergency Notice: {emg['message']}"
        })

    # 2. Extract symptoms
    extracted = diagnosis.extract_symptoms(message_text)
    updated_known = list(set(known_symptoms + extracted))

    # 3. Check for smart follow-up
    follow_up = diagnosis.get_follow_up(updated_known, asked_symptoms) if turn_count < 2 else None

    if follow_up:
        return jsonify({
            'is_emergency': False,
            'detected_symptoms': updated_known,
            'reply': follow_up['question'],
            'follow_up_candidates': follow_up['candidates'],
            'has_follow_up': True
        })

    # 4. Finalize analysis
    result = diagnosis.analyze_symptoms(updated_known)
    user_id = session.get('user_id')

    if user_id and updated_known:
        database.save_health_check(
            user_id=user_id,
            pattern_name=result['possible_pattern'],
            match_score=result['symptom_match'],
            severity=result['severity'],
            symptoms=result['detected_symptoms'],
            recommended_steps=result['recommended_steps'],
            is_emergency=False
        )

    return jsonify({
        'is_emergency': False,
        'detected_symptoms': updated_known,
        'has_follow_up': False,
        'diagnosis_result': result,
        'reply': f"Based on your symptoms, possible pattern: {result['possible_pattern']} (Symptom Match: {result['symptom_match']}%)."
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json() or {}
    symptom_ids = data.get('symptoms', [])

    result = diagnosis.analyze_symptoms(symptom_ids)
    user_id = session.get('user_id')

    if user_id and symptom_ids:
        database.save_health_check(
            user_id=user_id,
            pattern_name=result['possible_pattern'],
            match_score=result['symptom_match'],
            severity=result['severity'],
            symptoms=result['detected_symptoms'],
            recommended_steps=result['recommended_steps'],
            is_emergency=False
        )

    return jsonify({'result': result})

@app.route('/api/history', methods=['GET'])
def history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    records = database.get_user_history(user_id)
    return jsonify({'history': records})

@app.route('/api/history/<int:check_id>', methods=['GET'])
def history_detail(check_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    record = database.get_check_by_id(check_id, user_id)
    if not record:
        return jsonify({'error': 'Record not found'}), 404
    return jsonify({'record': record})

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
