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