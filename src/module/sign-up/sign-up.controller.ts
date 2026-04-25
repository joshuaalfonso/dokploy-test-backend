import bcrypt from "bcryptjs"
import { pool } from "../../config/db.js"


export const SignUpController = async (c: any) => {

    try {

        const { full_name, email, password } = await c.req.valid('json')

        if (!full_name || !email || !password) {
            return c.json({ 
                error: 'All fields are required' 
            }, 400)
        }

        const [existing]: any[] = await pool.query(
            `
                SELECT 
                    user_id 
                FROM 
                    users 
                WHERE 
                    email = ?
            `,
            [email]
        )

        if (existing.length > 0) {
            return c.json({ 
                error: 'Email already registered' 
            }, 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await pool.query(
            `
                INSERT INTO 
                    user (full_name, email, password) 
                VALUES 
                    (?, ?, ?)
            `,
            [full_name, email, hashedPassword]
        )

        return c.json({ 
            message: 'User created successfully' 
        }, 201)

    }

    catch (err) {
        console.error(err)
        return c.json({ 
            error: 'Internal server error' 
        }, 500)
    }


}