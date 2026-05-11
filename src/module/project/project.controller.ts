import { pool } from "../../config/db.js";






export const getProjectByUserController = async (c: any) => {

    try {

        // const user = c.get("user"); 

        const id = c.req.param('user_id')

        if (!id) {
            throw new Error('Missing id is required')
        }

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    p.*,
                    w.workspace_name
                FROM 
                    project p
                LEFT JOIN
                    workspace w
                ON
                    p.workspace_id = w.workspace_id
                WHERE
                    created_by = ?
                
            `, [id]
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load project'
        })
    }


}

export const getProjectByWorkspaceController = async (c: any) => {

    try {

        const id = c.req.param('workspace_id')

        if (!id) {
            throw new Error('Missing id is required')
        }

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    p.*,
                    w.workspace_name
                FROM 
                    project p
                LEFT JOIN
                    workspace w
                ON
                    p.workspace_id = w.workspace_id
                WHERE
                    w.workspace_id = ?
                
            `, [id]
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load project'
        })
    }


}




export const createProjectController = async (c: any) => {

    const conn = await pool.getConnection();
    
    try {

        const { workspace_id, project_name, project_description } = c.req.valid('json');

        const user = c.get("user"); 

        if (!user.user_id) {
            throw new Error('No user found')
        }

        await conn.beginTransaction();

        const [rows]: any = await conn.query(`
            INSERT INTO 
                project (workspace_id, project_name, project_description, created_by)
            VALUES (?, ?, ?, ?)

        `, [workspace_id, project_name, project_description, user.user_id]);

        const project_id = rows.insertId;

        if (!project_id) {
            throw new Error('No project id found')
        }

        await conn.query(`
            INSERT INTO
                project_member (project_id, user_id, role)
            VALUES (?, ?, ?)
        `, [project_id, user.user_id, 'manager']);

        await conn.commit();

        return c.json({
            success: false,
            message: `Project '${project_name}' is created`
        })

    }
    
    catch (err: any) {
        console.log(err);
        conn.rollback();
        return c.json({
            success: false,
            message: 'Failed to create project'
        }, 500)
    } finally {
        conn.release();
    }

}

export const updateProjectController = async (c: any) => {

    const conn = await pool.getConnection();
    
    try {

        const { project_id,  project_name, project_description } = c.req.valid('json');

        // const user = c.get("user"); 

        // if (!user.user_id) {
        //     throw new Error('No user found')
        // }

        // await conn.beginTransaction();

        await conn.query(`
            UPDATE 
                project set project_name = ?, project_description = ?
            WHERE project_id = ?

        `, [project_name, project_description, project_id]);


        return c.json({
            success: false,
            message: `Project '${project_name}' is updated`
        })

    }
    
    catch (err: any) {
        console.log(err);
        conn.rollback();
        return c.json({
            success: false,
            message: 'Failed to update project'
        }, 500)
    } finally {
        conn.release();
    }

}