import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Connect to your "Canary Elephant" using the secret variable from Step 1
    const sql = neon(process.env.DATABASE_URL);

    const { username, password } = req.body;

    try {
        // VULNERABLE SQL (The goal of your project)
        // We are directly inserting user input into the query string
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        
        const result = await sql(query);

        if (result.length > 0) {
            // If we found a user, login is successful
            return res.status(200).json({ success: true, user: result[0].username });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        // This returns the database error to the screen (useful for SQL injection demos!)
        return res.status(500).json({ success: false, error: error.message });
    }
}