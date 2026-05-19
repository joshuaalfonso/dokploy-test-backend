import { pool } from "../../config/db.js";






export const getallTaskController = async (c: any) => {

    try {

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    t.*
                FROM 
                    task t
                LEFT JOIN
                    project p 
                ON
                    t.project_id = p.project_id
                
            `
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load task'
        })
    }


}


export const getTaskByProjectController = async (c: any) => {

    try {

        const id = c.req.param('project_id')

        if (!id) {
            throw new Error('Missing id is required')
        }

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    t.*,
                    p.project_name,
                    u.full_name,
                    u.email,
                    COALESCE(
                        CONCAT(
                            '[',
                            GROUP_CONCAT(
                                DISTINCT JSON_OBJECT(
                                    'user_id', au.user_id,
                                    'full_name', au.full_name,
                                    'email', au.email
                                )
                            ),
                            ']'
                        ),
                        '[]'
                    ) AS assignees
                    
                FROM 
                    task t
                LEFT JOIN
                    project p 
                ON
                    t.project_id = p.project_id
                LEFT JOIN
                    user u 
                ON
                    t.created_by = u.user_id
                LEFT JOIN task_assignee ta
                    ON t.task_id = ta.task_id

                LEFT JOIN user au
                    ON ta.user_id = au.user_id
                WHERE
                    p.project_id = ?
                GROUP BY t.task_id
                ORDER BY t.created_at DESC
                
            `, [id]
        )

        const tasks = rows.map((task: any) => ({
            ...task,
            assignees: JSON.parse(task.assignees || '[]')
        }));

        return c.json(tasks)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load task'
        })
    }

}



export const createTaskController = async (c: any) => {


    const conn = await pool.getConnection();
    
    try {

        const { project_id, task_title, task_description, priority, status, due_date, task_assignee } = c.req.valid('json');

        const user = c.get("user"); 

        if (!user.user_id) {
            throw new Error('No user found')
        }

        await conn.beginTransaction();

        const [rows]: any = await conn.query(`
            INSERT INTO 
                task (project_id, task_title, task_description, priority, status, due_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)

        `, [project_id, task_title, task_description, priority, status, due_date, user.user_id]);

        const task_id = rows.insertId;

        if (!task_id) {
            throw new Error('No task id found')
        }

        for (const item of task_assignee) {
            await conn.query(`
                INSERT INTO
                    task_assignee (task_id, user_id)
                VALUES (?, ?)
            `, [task_id, item]);
        }


        await conn.commit();

        return c.json({
            success: true,
            message: `Task '${task_title}' is created`
        }, 200)

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