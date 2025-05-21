const db = require('../../database');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { session_id, user_name, user_email, seats } = JSON.parse(event.body);

        if (!session_id || !user_name || !user_email || !seats) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'All fields are required!' }),
            };
        }
        if (!Number.isInteger(seats) || seats <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Seats must be a positive integer!' }),
            };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user_email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email format!' }),
            };
        }

        const row = await new Promise((resolve, reject) => {
            db.get(`SELECT available_seats FROM sessions WHERE id = ?`, [session_id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!row) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Session not found!' }),
            };
        }
        if (row.available_seats < seats) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Not enough available seats!' }),
            };
        }

        const newAvailableSeats = row.available_seats - seats;
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE sessions SET available_seats = ? WHERE id = ?`,
                [newAvailableSeats, session_id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const bookingId = await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO bookings (session_id, user_name, user_email, seats) VALUES (?, ?, ?, ?)`,
                [session_id, user_name, user_email, seats],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, booking_id: bookingId }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error: ' + error.message }),
        };
    }
};