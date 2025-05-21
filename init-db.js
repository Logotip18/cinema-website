const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./cinema.db');

db.serialize(() => {
    // Создание таблицы movies (фильмы)
    db.run(`
        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )
    `);

    // Создание таблицы sessions (сеансы)
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

    // Создание таблицы bookings (бронирования)
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

    // Пример: добавление тестового фильма (опционально)
    db.run(`INSERT OR IGNORE INTO movies (title) VALUES (?)`, ['Тестовый фильм']);
});

db.close();

console.log('База данных инициализирована или уже существует.');