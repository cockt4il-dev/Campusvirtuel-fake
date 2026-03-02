import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sql = neon(process.env.DATABASE_URL);

    const { username, password } = req.body;

    const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        "unknown";

    try {
        // INTENTIONALLY VULNERABLE LOGIN CHECK
        const query = `
            SELECT * FROM users 
            WHERE username = '${username}' 
            AND password = '${password}'
        `;

        const result = await sql(query);

        // Log every attempt (no extra fields)
        await sql`
            INSERT INTO login_attempts
            (attempted_username, attempted_password, ip_address)
            VALUES (${username}, ${password}, ${ip})
        `;

        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                user: result[0].username
            });
        } else {
            return res.status(401).json({
                success: false
            });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}