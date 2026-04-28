import bcrypt from "bcryptjs"
import { pool } from "../../config/db.js"
import { randomInt } from "crypto";
import { transport } from "../../config/smtp.js";


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
                success: false,
                message: 'Email already registered' 
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

        const code = randomInt(100000, 999999).toString();

        const hashedCode = await bcrypt.hash(code, 10);

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await conn.query(
            `
            INSERT INTO 
                email_verification (user_id, code_hash, expires_at)
            VALUES 
                (?, ?, ?)
            `,
            [userId, hashedCode, expiresAt]
        )

        const mailOptions = { 
            from: '"Strive" <noreply@strive.skadii-dev.org>',
            to: email,
            subject: 'Email Verification',
            html: `<p>Your verification code is: ${code}</p>`
        }; 

        await transport.sendMail(mailOptions);

        // await sendEmail({
        //     to: email,
        //     subject: 'Verify your email',
        //     text: `Your verification code is: ${code}`
        // })

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



