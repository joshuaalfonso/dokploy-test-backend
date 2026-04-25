import bcrypt from "bcryptjs"
import { pool } from "../../config/db.js"


export const SignUpController = async (c: any) => {

    const conn = await pool.getConnection();

    try {

        await conn.beginTransaction();

        const { full_name, email, password } = await c.req.valid('json')

        const [existing]: any[] = await conn.query(
            `
                SELECT 
                    user_id 
                FROM 
                    user
                WHERE 
                    email = ?
            `,
            [email]
        )

        if (existing.length > 0) {
            await conn.rollback();
            return c.json({ 
                error: 'Email already registered' 
            }, 400)
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [userResult]: any = await conn.query(
            `
                INSERT INTO  
                    user (full_name, email, password_hash) 
                VALUES 
                    (?, ?, ?)
            `,
            [full_name, email, hashedPassword]
        )

        const userId = userResult.insertId;

        const [workspaceResult]: any = await conn.query(
            `
                INSERT INTO 
                    workspace (workspace_name, owner_id)
                VALUES 
                    (?, ?)
            `,
            [`${full_name}'s Workspace`, userId]
        )

        await conn.query(
            `
                INSERT INTO 
                    workspace_member (workspace_id, user_id, role)
                VALUES (?, ?, ?)
            `,
            [workspaceResult.insertId, userId, 'owner']
        )

        await conn.commit();


        return c.json({ 
            success: true,
            message: 'Registered successfully' 
        }, 201)

    }

    catch (err) {
        await conn.rollback()
        console.error(err)
        return c.json({ 
            success: false,
            error: 'Internal server error' 
        }, 500)
    }
    
        finally {
        conn.release()
    }


}