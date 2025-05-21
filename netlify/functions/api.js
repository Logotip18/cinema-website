const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./cinema.db');

const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS movies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    movie_id INTEGER,
                    date TEXT,
                    time TEXT,
                    available_seats INTEGER,
                    FOREIGN KEY (movie_id) REFERENCES movies(id)
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id INTEGER,
                    user_name TEXT,
                    user_email TEXT,
                    seats INTEGER,
                    payment_status TEXT DEFAULT 'pending',
                    FOREIGN KEY (session_id) REFERENCES sessions(id)
                )
            `);

            // Тестовые данные (опционально)
            db.run(`INSERT OR IGNORE INTO movies (title) VALUES (?)`, ['Тестовый фильм']);
            resolve();
        });
    });
};

exports.handler = async (event, context) => {
    // Инициализация базы данных при первом запуске
    await initializeDatabase();

    const { httpMethod, path, queryStringParameters, body } = event;

    if (httpMethod === 'GET' && path === '/api/movies') {
        return new Promise((resolve) => {
            db.all(`SELECT * FROM movies`, [], (err, rows) => {
                if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                resolve({ statusCode: 200, body: JSON.stringify(rows) });
            });
        });
    }

    if (httpMethod === 'GET' && path === '/api/sessions') {
        const { date } = queryStringParameters || {};
        let query = `SELECT s.*, m.title AS movie_title FROM sessions s JOIN movies m ON s.movie_id = m.id`;
        let params = [];
        if (date) {
            query += ` WHERE s.date = ?`;
            params.push(date);
        }
        return new Promise((resolve) => {
            db.all(query, params, (err, rows) => {
                if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                resolve({ statusCode: 200, body: JSON.stringify(rows) });
            });
        });
    }

    if (httpMethod === 'POST' && path === '/api/movies') {
        const { title } = JSON.parse(body);
        if (!title) return { statusCode: 400, body: JSON.stringify({ error: 'Title is required' }) };

        return new Promise((resolve) => {
            db.run(`INSERT INTO movies (title) VALUES (?)`, [title], function (err) {
                if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                resolve({ statusCode: 200, body: JSON.stringify({ id: this.lastID, title }) });
            });
        });
    }

    if (httpMethod === 'POST' && path === '/api/sessions') {
        const { movie_id, date, time, available_seats } = JSON.parse(body);
        if (!movie_id || !date || !time || !available_seats) {
            return { statusCode: 400, body: JSON.stringify({ error: 'All fields are required' }) };
        }

        return new Promise((resolve) => {
            db.run(
                `INSERT INTO sessions (movie_id, date, time, available_seats) VALUES (?, ?, ?, ?)`,
                [movie_id, date, time, available_seats],
                function (err) {
                    if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                    resolve({ statusCode: 200, body: JSON.stringify({ id: this.lastID, movie_id, date, time, available_seats }) });
                }
            );
        });
    }

    if (httpMethod === 'GET' && path === '/api/bookings') {
        const { session_id } = queryStringParameters;
        if (!session_id) return { statusCode: 400, body: JSON.stringify({ error: 'Session ID is required' }) };

        return new Promise((resolve) => {
            db.all(
                `SELECT * FROM bookings WHERE session_id = ?`,
                [session_id],
                (err, rows) => {
                    if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                    resolve({ statusCode: 200, body: JSON.stringify(rows) });
                }
            );
        });
    }

    if (httpMethod === 'POST' && path === '/api/payment') {
        const { booking_id } = JSON.parse(body);
        if (!booking_id) return { statusCode: 400, body: JSON.stringify({ error: 'Booking ID is required' }) };

        return new Promise((resolve) => {
            db.run(
                `UPDATE bookings SET payment_status = 'completed' WHERE id = ?`,
                [booking_id],
                (err) => {
                    if (err) resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
                    resolve({ statusCode: 200, body: JSON.stringify({ success: true, message: 'Payment completed (test mode)' }) });
                }
            );
        });
    }

    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };
};