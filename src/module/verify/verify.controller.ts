import bcrypt from "bcryptjs";
import { pool } from "../../config/db.js";




export const verifyEmailController = async (c: any) => {

    const conn = await pool.getConnection();

    try {

        await conn.beginTransaction();

        const { email, code } = await c.req.valid('json')

        const [users]: any[] = await conn.query(
            `
                SELECT 
                    user_id, is_verified 
                FROM 
                    user 
                WHERE 
                    email = ?`,
            [email]
        )

        if (users.length === 0) {
            await conn.rollback()
            conn.release();
            return c.json({ 
                success: false, 
                message: 'User not found' 
            }, 404)
        }

        const user = users[0];

        if (user.is_verified) {
            await conn.rollback()
            conn.release();
            return c.json({
                success: false, 
                message: 'Already verified' 
            }, 200)
        }

        const [records]: any[] = await conn.query(
            `
            SELECT 
                * 
            FROM 
                email_verification
            WHERE 
                user_id = ?
            ORDER BY 
                created_at DESC LIMIT 1
            `,
            [user.user_id]
        )

        if (records.length === 0) {
            await conn.rollback()
            conn.release();
            return c.json({ 
                success: false, 
                message: 'No verification request found' 
            }, 400)
        }

        const record = records[0];

        //  Check expiry
        if (new Date() > new Date(record.expires_at)) {
            await conn.rollback()
            conn.release();
            return c.json({ 
                success: false, 
                message: 'Code expired' 
            }, 400)
        }

        // Compare code
        const isMatch = await bcrypt.compare(code, record.code_hash);


        if (!isMatch) {
            await conn.rollback()
            conn.release();
            return c.json({ 
                success: false, 
                message: 'Invalid code' 
            }, 400)
        }

        // mark user as verified
        await conn.query(
            `
                UPDATE 
                    user 
                SET 
                    is_verified = 1 
                WHERE 
                    user_id = ?`,
            [user.user_id]
        )

        // 🗑️ Optional: delete used codes
        await conn.query(
            `
                DELETE FROM 
                    email_verification 
                WHERE 
                    user_id = ?`,
            [user.user_id]
        )

        await conn.commit();

        return c.json({
            success: true,
            message: 'Email verified successfully'
        })

    } catch (err) {
        await conn.rollback()
        console.error(err)
        return c.json({ error: 'Internal server error' }, 500)

    } finally {
        conn.release()
    }
}