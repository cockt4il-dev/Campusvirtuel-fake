import { db } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  const client = await db.connect();

  try {
    /** * VULNERABLE CODE: 
     * We are injecting the username/password directly into the string.
     * A payload like: ' OR '1'='1 
     * results in: SELECT * FROM users WHERE username = '' OR '1'='1' ...
     */
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    const { rows } = await client.query(query);

    if (rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Logged in!', user: rows[0].username });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    // Returning the error helps with "Error-Based SQL Injection"
    return res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
}