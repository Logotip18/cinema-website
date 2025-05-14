const { promises: fs } = require('fs');
     const path = require('path');

     exports.handler = async (event, context) => {
       const sessionsFile = path.join(__dirname, 'sessions.json');
       let sessions = [];

       try {
         // Читаем существующие сеансы
         try {
           const data = await fs.readFile(sessionsFile, 'utf8');
           sessions = JSON.parse(data || '[]');
         } catch (error) {
           console.log('Error reading sessions file:', error);
           // Если файла нет, создаём пустой массив
           await fs.writeFile(sessionsFile, '[]', 'utf8');
         }

         if (event.httpMethod === 'GET') {
           return {
             statusCode: 200,
             body: JSON.stringify(sessions),
           };
         }

         if (event.httpMethod === 'POST') {
           const { movie, date, time } = JSON.parse(event.body);
           if (!movie || !date || !time) {
             return {
               statusCode: 400,
               body: JSON.stringify({ message: 'Missing required fields: movie, date, time' }),
             };
           }
           const newSession = { movie, date, time, id: Date.now() };
           sessions.push(newSession);
           await fs.writeFile(sessionsFile, JSON.stringify(sessions, null, 2), 'utf8');
           return {
             statusCode: 200,
             body: JSON.stringify(newSession),
           };
         }

         return {
           statusCode: 400,
           body: JSON.stringify({ message: 'Метод не поддерживается' }),
         };
       } catch (error) {
         console.log('Server error:', error);
         return {
           statusCode: 500,
           body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
         };
       }
     };