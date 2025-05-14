let sessions = []; // Храним сеансы в памяти (временное решение)

exports.handler = async (event, context) => {
  try {
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
      sessions.push(newSession); // Добавляем в массив в памяти
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