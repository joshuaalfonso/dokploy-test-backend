import { pool } from "../../config/db.js";



export const getWorkspaceMemberController = async (c: any) => {

    try {

        const workspace_id = c.req.param('workspace_id')

        if (!workspace_id) {
            throw new Error('Missing id is required')
        }

        const [rows]: any = await pool.query(`
            
            SELECT 
                wm.*,
                w.workspace_name,
                u.full_name,
                u.email
            FROM
                workspace_member wm
            LEFT JOIN
                workspace w
            ON
                wm.workspace_id = w.workspace_id
            LEFT JOIN
                user u
            ON
                wm.user_id = u.user_id
            WHERE
                wm.workspace_id = ?
            
        `, [workspace_id]);

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load workspace member'
        }, 500)
    }

}