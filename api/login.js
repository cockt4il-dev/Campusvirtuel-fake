import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // This pulls the secret string from Vercel's settings
    const sql = neon(process.env.DATABASE_URL);

    const { username, password } = req.body;

    try {
        // VULNERABLE SQL QUERY
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        
        const result = await sql(query);

        if (result.length > 0) {
            return res.status(200).json({ success: true, user: result[0].username });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}