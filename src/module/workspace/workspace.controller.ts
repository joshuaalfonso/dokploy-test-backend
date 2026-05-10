import { pool } from "../../config/db.js"






export const getWorkspaceController = async (c: any) => {

    // const user = c.get("user");

    try {
        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    w.*,
                FROM 
                    workspace w
                LEFT JOIN
                    user u
                ON
                    w.owner_id = u.user_id
                
            `
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load workspace'
        })
    }


}


export const getWorkspaceByUserController = async (c: any) => {

    try {

        const { user_id } = c.req.valid('param');

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    w.*,
                    wm.role
                FROM 
                    workspace w
                INNER JOIN 
                    workspace_member wm
                ON 
                    wm.workspace_id = w.workspace_id
                WHERE 
                    wm.user_id = ? ;
                                
            `, [user_id]
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load workspace'
        })
    }

}


export const createWorkspaceController = async (c: any) => {


    const conn = await pool.getConnection();

    try {

        const { workspace_name, description } = c.req.valid('json');

        const user = c.get("user"); 

        if (!user.user_id) {
            throw new Error('No user found')
        }

        await conn.beginTransaction();

        const [rows]: any = await conn.query(`
            INSERT INTO 
                workspace (workspace_name, description, owner_id)
            VALUES (?, ?, ?)

        `, [workspace_name, description, user.user_id]);

        const workspace_id = rows.insertId;

        if (!workspace_id) {
            throw new Error('No workspace id found')
        }

        await conn.query(`
            INSERT INTO
                workspace_member (workspace_id, user_id, role)
            VALUES (?, ?, ?)
        `, [workspace_id, user.user_id, 'admin'])

        return c.json({
            success: false,
            message: `Workspace ${workspace_name} is created`
        })

    }

    catch (err: any) {
        console.log(err);
        conn.rollback();
        return c.json({
            success: false,
            message: err instanceof Error
            ? err.message
            : 'Failed to create workspace'
        }, 500)
    } finally {
        conn.release();
    }


}