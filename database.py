"""
Database layer for HealthAI Symptom Checker & Diagnosis Assistant.
Uses SQLite with secure password hashing and relational tables.
"""

import sqlite3
import os
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'health.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            preferences TEXT DEFAULT '{}'
        )
    ''')

    # 2. Symptoms master catalog
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS symptoms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            synonyms TEXT NOT NULL
        )
    ''')

    # 3. Health checks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_checks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            possible_pattern TEXT NOT NULL,
            match_score INTEGER NOT NULL,
            severity TEXT NOT NULL,
            date_time TEXT NOT NULL,
            is_emergency INTEGER DEFAULT 0,
            recommended_steps TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # 4. Health check symptoms junction
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_check_symptoms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            check_id INTEGER NOT NULL,
            symptom_name TEXT NOT NULL,
            FOREIGN KEY (check_id) REFERENCES health_checks (id) ON DELETE CASCADE
        )
    ''')

    # Seed default user if not exists
    cursor.execute('SELECT id FROM users WHERE email = ?', ('rakshit@health.ai',))
    if not cursor.fetchone():
        hashed = generate_password_hash('password123')
        cursor.execute('''
            INSERT INTO users (full_name, email, password_hash, created_at, preferences)
            VALUES (?, ?, ?, ?, ?)
        ''', ('Rakshit Sharma', 'rakshit@health.ai', hashed, datetime.utcnow().isoformat(), json.dumps({
            'voiceEnabled': True,
            'speechSpeed': 1.0,
            'theme': 'light'
        })))

    conn.commit()
    conn.close()

def create_user(full_name, email, plain_password):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        hashed = generate_password_hash(plain_password)
        now = datetime.utcnow().isoformat()
        default_prefs = json.dumps({'voiceEnabled': True, 'speechSpeed': 1.0, 'theme': 'light'})
        cursor.execute('''
            INSERT INTO users (full_name, email, password_hash, created_at, preferences)
            VALUES (?, ?, ?, ?, ?)
        ''', (full_name, email.lower().strip(), hashed, now, default_prefs))
        conn.commit()
        user_id = cursor.lastrowid
        return {
            'id': user_id,
            'name': full_name,
            'email': email.lower().strip(),
            'createdAt': now,
            'preferences': {'voiceEnabled': True, 'speechSpeed': 1.0, 'theme': 'light'}
        }
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(email_or_name, plain_password):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(full_name) = LOWER(?)
    ''', (email_or_name.strip(), email_or_name.strip()))
    row = cursor.fetchone()
    conn.close()

    if row and check_password_hash(row['password_hash'], plain_password):
        prefs = json.loads(row['preferences']) if row['preferences'] else {}
        return {
            'id': row['id'],
            'name': row['full_name'],
            'email': row['email'],
            'createdAt': row['created_at'],
            'preferences': prefs
        }
    return None

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            'id': row['id'],
            'name': row['full_name'],
            'email': row['email'],
            'createdAt': row['created_at'],
            'preferences': json.loads(row['preferences']) if row['preferences'] else {}
        }
    return None

def update_user_preferences(user_id, prefs_dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET preferences = ? WHERE id = ?', (json.dumps(prefs_dict), user_id))
    conn.commit()
    conn.close()

def save_health_check(user_id, pattern_name, match_score, severity, symptoms, recommended_steps, is_emergency=False):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute('''
        INSERT INTO health_checks (user_id, possible_pattern, match_score, severity, date_time, is_emergency, recommended_steps)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, pattern_name, match_score, severity, now, 1 if is_emergency else 0, json.dumps(recommended_steps)))
    check_id = cursor.lastrowid

    for sym in symptoms:
        cursor.execute('''
            INSERT INTO health_check_symptoms (check_id, symptom_name)
            VALUES (?, ?)
        ''', (check_id, sym))

    conn.commit()
    conn.close()
    return check_id

def get_user_history(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT hc.*, GROUP_CONCAT(hcs.symptom_name, ', ') AS symptoms_joined
        FROM health_checks hc
        LEFT JOIN health_check_symptoms hcs ON hc.id = hcs.check_id
        WHERE hc.user_id = ?
        GROUP BY hc.id
        ORDER BY hc.id DESC
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        steps = json.loads(r['recommended_steps']) if r['recommended_steps'] else []
        sym_list = [s.strip() for s in (r['symptoms_joined'] or '').split(',') if s.strip()]
        history.append({
            'id': r['id'],
            'date': r['date_time'],
            'possiblePattern': r['possible_pattern'],
            'symptomMatch': r['match_score'],
            'severity': r['severity'],
            'symptoms': sym_list,
            'recommendedSteps': steps,
            'isEmergency': bool(r['is_emergency'])
        })
    return history

def get_check_by_id(check_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM health_checks WHERE id = ? AND user_id = ?', (check_id, user_id))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None

    cursor.execute('SELECT symptom_name FROM health_check_symptoms WHERE check_id = ?', (check_id,))
    symptoms = [s['symptom_name'] for s in cursor.fetchall()]
    conn.close()

    return {
        'id': row['id'],
        'date': row['date_time'],
        'possiblePattern': row['possible_pattern'],
        'symptomMatch': row['match_score'],
        'severity': row['severity'],
        'symptoms': symptoms,
        'recommendedSteps': json.loads(row['recommended_steps']) if row['recommended_steps'] else [],
        'isEmergency': bool(row['is_emergency'])
    }
