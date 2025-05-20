const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "lvg-kino",
      clientEmail: "firebase-adminsdk-fbsvc@lvg-kino.iam.gserviceaccount.com",
      privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDicbYlUD63sxd9
kfROilFB9BUvQjfmJVDmo+OOL80W3Aq3cSwUPqyzWE9HXg+odYHdQEQIFtBZRGCW
NJ5cOkL/8OxATyYBDjsua4ju96kbTVENUBFVCkjnF3j3XR8gOCFQ+ieY3HZJc9UE
IOWd+sGDKdcR+nPrX96SU62UEvKrwxChprcTYY63CADZiOsCzESnyyEKBN/8uNSa
7vOug77GcmwooEBBAbUd/2dqscUoSmfvd8qSPpQyqRrla9vOubXHYCMnrF0NpIuP
ZO95vvyW1XJrHw6NgCDQuyjFhGAwQ/dyaPMnFzMJBoaewyAUDzexIDQlhJyNYqyk
N72OSLdNAgMBAAECggEAAeGg+kli5ALUaKIsTfS/PRWKkYRy03Iu7GOjMdy6zvxQ
CHsjux1UMP9EVVr2NVeYlx6AEjMiUwOK6+SPBkQjp124kMY3kh2spzOUhSvAl236
hOpL4pF9zpG22xNGfW2J9VLGvnHid7TDKdAeKERblDvmQgt7KBL5VezlDcxkgMHP
ofrYixHTAlWMAQFIf6ZMc/tb2C2/OWgp+L6LYb0osIcaA4bRJ9MFog0ACjgkO7K2
2KMTqUYJucUxeYfPcc1cWA7XysPq2ue20V+5QslH/lrpgqnFpJFsHPSJSHzXsrLB
qlhbmxsFzZaStXvUpgYrXq9+ZPz2EeN/WujPg+oQnwKBgQD67Uzut1EqWJ3f6uz0
lwPbYePWvvbWXMD0p9xrocQ8jne/OQSFWtfnmbHD3PImlhxtfeFibJA7Sj8FJLO1
bfEKDfmE6DWwGXMSVL1mdocutkj7FFDH32bcAqGRIpqvnR/71wp/vEf6vlLBMfD3
tdD3uGBI7P1FKABdtahbbwcMCwKBgQDnBbKhnImnwwBrbWqYL7K8W9qten9kDr4a
Sr+5hJ5lc41YP2EcJ6qlSMQTWQF2ruJDJxqdlItSLkVML4rKpQxN91+i5gkSl04M
WLmSpWbsX4kA0wd9w3XN6cTaJve1BaUa0xJO/1F+/4kVFv+zXhf7ZaerDZPF9Atz
LXusEOEJBwKBgQCMdnXQU1HeEIkfpVRLfpWsItn1hiSKzpU83xJmNcGx3FZv9qzv
MXEWtlRqPa5Xp0P2jrax7++1INSyPl9Sul5psHTyz0Hud/CQXFtBliwKHAQyeKbX
m9jqY5apteM9VwlmYnQAGRd55zxP5XLsVxzI7q8HY5JLOh8qVdwOgtJBDQKBgQDL
N27fzKQmJ1mKJjB6+JJAMIiWy0eeC33cAN7P4UG4OkIeW3of2yC3zd90qXmpHcM4
kQBPl2hKfRtGHhf3k+HT/4Nn9vQKH4BvSejLf6WezZblW7yeOz64SCd6Qobo/LM0
enEDfoIAteWu4JFDBcUQxmYMCKBxo/Aie+LrA9oAJwKBgGKzjfWaXzNvLSjDc+xW
afh9e8fR8JalNhWov4UBmDKsFkckPQuMrckLdnOBWY7udxqdGxnVEfL7rWWLYpWl
D7k6atCG3RmSGg8jLDjL0RjPEmKPAJTz2kQNfHGr2lr+LnWCTb/qluBDtNSbKXhQ
i3zbpSfypHXXuugnDKoRXykm
-----END PRIVATE KEY-----`
    }),
  });
}

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      const { movie, date, time } = event.queryStringParameters || {};
      if (!movie || !date || !time) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ message: 'Missing required query parameters: movie, date, time' }),
        };
      }
      const sessionKey = `seats_${movie}_${date}_${time}`;
      const snapshot = await db.collection('bookings').doc(sessionKey).get();
      const bookings = snapshot.exists ? snapshot.data().seats : [];
      console.log('Fetched bookings for session:', sessionKey, bookings);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(bookings),
      };
    }

    if (event.httpMethod === 'POST') {
      const { movie, date, time, seats } = JSON.parse(event.body);
      if (!movie || !date || !time || !seats) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
          body: JSON.stringify({ message: 'Missing required fields: movie, date, time, seats' }),
        };
      }
      const sessionKey = `seats_${movie}_${date}_${time}`;
      await db.collection('bookings').doc(sessionKey).set({ seats }, { merge: true });
      console.log('Saved bookings for session:', sessionKey, seats);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({ message: 'Booking saved' }),
      };
    }

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Method not supported' }),
    };
  } catch (error) {
    console.log('Server error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};