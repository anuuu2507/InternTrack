import sqlite3

def init_db():
    conn = sqlite3.connect('interntrack.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'admin'))
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            stipend TEXT,
            deadline TEXT,
            description TEXT,
            posted_by INTEGER,
            FOREIGN KEY (posted_by) REFERENCES users(id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            opportunity_id INTEGER,
            status TEXT DEFAULT 'Applied',
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database created successfully!")