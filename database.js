const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Database connected successfully.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER,
        date TEXT,
        time TEXT,
        available_seats INTEGER,
        FOREIGN KEY (movie_id) REFERENCES movies (id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        user_name TEXT,
        user_email TEXT,
        seats INTEGER,
        payment_status TEXT DEFAULT 'pending',
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        else console.log('Database connection closed.');
        process.exit(0);
    });
});

module.exports = db;