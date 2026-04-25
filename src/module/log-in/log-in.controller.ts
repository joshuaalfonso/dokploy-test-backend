import { SignJWT } from "jose";
import "dotenv/config";
import { pool } from "../../config/db.js";
import bcrypt from "bcryptjs";



export const logInController = async (c: any) => {

    const JWT_SECRET = new TextEncoder().encode(
        process.env.JWT_SECRET || "super-secret-key"
    );

    try {

        const { email, password } = await c.req.valid('json');

        // chech user
        const [rows]: any = await pool.execute(
            `
                SELECT 
                    user_id, email, full_name, password_hash 
                FROM 
                    user 
                WHERE 
                    email = ? LIMIT 1
            `,
            [email]
        );

        const user = rows[0];

        if (!user) {
            return c.json({ message: "Invalid credentials" }, 401);
        }

        const [oldestWorkspace]: any = await pool.execute(
            `
                SELECT
                    owner_id
                FROM 
                    workspace
                WHERE
                    owner_id = ?
                ORDER BY
                    created_at
                LIMIT 1
            `, [user.user_id]
        )

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return c.json({ message: "Invalid credentials" }, 401);
        }

        // create jwt
        const token = await new SignJWT({
            user_id: String(user.user_id),
            email: user.email,
        })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10h")
        .sign(JWT_SECRET);

        // return token
        return c.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                default_workspace: oldestWorkspace[0].owner_id
            },
        });

    } catch (err) {

        return c.json({ 
            message: "Server error", 
            error: String(err) }, 
        500);

    }


}