import { pool } from "../../config/db.js";
// import type { Project } from "./project.model.js";




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
        }, 500)
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
        }, 500)
    }


}


export const getProjectTimelineByUserController = async (c: any) => {


    try {

        const id = c.req.param('project_id')

        if (!id) {
            throw new Error('Missing id is required')
        }


        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    pm.user_id,
                    pm.full_name,
                    pm.email,

                    pt.id AS task_id,
                    pt.name AS task_name,
                    pt.start_date,
                    pt.end_date,
                    pt.status,
                    pt.percent,

                    CASE 
                        WHEN pt.status = 'todo' THEN '#94A3B8'
                        WHEN pt.status = 'in_progress' THEN '#3B82F6'
                        WHEN pt.status = 'for_review' THEN '#F59E0B'
                        WHEN pt.status = 'completed' THEN '#22C55E'
                        ELSE '#94A3B8'
                    END AS color

                FROM 
                    project_member pm
                JOIN 
                    user u 
                ON 
                    u.user_id = pm.user_id
                WHERE 
                    pt.project_id = ?
                ORDER BY 
                    pm.user_id;
                
            `, [id]
        )

        return c.json({
            ...rows[0]
        })

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load data'
        }, 500)
    }


}


export const getSingleProjectController = async (c: any) => {

    try {

        const id = c.req.param('project_id')

        if (!id) {
            throw new Error('Missing id is required')
        }


        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    p.*,
                    w.workspace_name,
                    COUNT(t.task_id) AS total_task,
                    SUM(
                        CASE 
                            WHEN t.status = 'completed' THEN 1
                            ELSE 0
                        END
                    ) AS completed_task
                FROM 
                    project p
                LEFT JOIN
                    workspace w 
                ON
                    p.workspace_id = w.workspace_id
                LEFT JOIN 
                    task t
                ON 
                    p.project_id = t.project_id
                WHERE
                    p.project_id = ? 
                
            `, [id]
        )

        return c.json({
            ...rows[0]
        })

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load project'
        }, 500)
    }


}


export const getProjectMemberController = async (c: any) => {


    try {

        const id = c.req.param('project_id')

        if (!id) {
            throw new Error('Missing id is required')
        }

        const [rows]: any[] = await pool.query(
            `
                SELECT 
                    pm.*,
                    p.project_name,
                    u.full_name,
                    u.email
                FROM 
                    project_member pm
                LEFT JOIN
                    project p
                ON
                    pm.project_id = p.project_id
                LEFT JOIN
                    user u
                ON
                    pm.user_id = u.user_id
                WHERE
                    pm.project_id = ?
                
            `, [id]
        )

        return c.json(rows)

    }

    catch (err) {
        console.log(err);
        return c.json({
            success: false,
            message: 'Failed to load project member'
        }, 500)
    }


}

// function encodeCursor(data: any) {
//   return Buffer.from(JSON.stringify(data)).toString('base64')
// }

// function decodeCursor(cursor: string) {
//   return JSON.parse(Buffer.from(cursor, 'base64').toString())
// }


export const getPaginatedProjectController = async (c: any) => {

    const workspace_id = c.req.param('workspace_id');

    const limit = Number(c.req.query('limit')) || 10
    const page = Number(c.req.query('page')) || 1
    const offset = (page - 1) * limit

    const search = c.req.query('search') || ''
    const status = c.req.query('status')

    // sorting
    const allowedSortFields = new Set([
        'created_at',
        'project_name',
        'status'
    ]);

    const sortByRaw = c.req.query('sort') || 'created_at' 
    const sortBy = allowedSortFields.has(sortByRaw)
        ? sortByRaw
        : 'created_at'

    const order = c.req.query('order') === 'asc' ? 'ASC' : 'DESC'

    const conditions: string[] = [
        `p.workspace_id = ?`
    ]

    const params: any[] = [workspace_id]

    // search
    if (search) {
        conditions.push(`
            (
                p.project_name LIKE ?
                OR p.project_description LIKE ?
            )
        `)

        params.push(`%${search}%`, `%${search}%`)
    }

    // status
    if (status) {
        conditions.push(`p.status = ?`)
        params.push(status)
    }

    // where
    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : ''

    // order
    const orderBy = `
        ORDER BY p.${sortBy} ${order}, p.project_id ${order}
    `

    // query
    const query = `
        SELECT
            p.project_id,
            p.workspace_id,
            p.project_name,
            p.project_description,
            p.created_at,
            p.status,
            p.created_by,
            w.workspace_name,
            COALESCE(tt.total_task, 0) AS total_task,
            COALESCE(tt.completed_task, 0) AS completed_task,
            COALESCE(
                ROUND(
                    (COALESCE(tt.completed_task, 0) / NULLIF(tt.total_task, 0)) * 100
                ),
                0
            ) AS completion_percentage,
             COALESCE(m.members, '') AS project_member
        FROM 
            project p
        JOIN 
            workspace w
        ON 
            w.workspace_id = p.workspace_id
        LEFT JOIN (
            SELECT
                t.project_id,
                COUNT(*) AS total_task,
                SUM(t.status = 'completed') AS completed_task
            FROM 
                task t
            GROUP BY 
                t.project_id
        ) tt
            ON tt.project_id = p.project_id
        LEFT JOIN (
            SELECT
                pm.project_id,
                GROUP_CONCAT(u.full_name SEPARATOR ', ') AS members
            FROM 
                project_member pm
            JOIN 
                user u
            ON 
                u.user_id = pm.user_id
            GROUP BY 
                pm.project_id
        ) m
        ON 
            m.project_id = p.project_id
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
    `

    params.push(limit, offset)

    const [rows]: any = await pool.query(query, params)

    // response
    const totalCountQuery = `
        SELECT COUNT(*) as count
        FROM project p
        ${whereClause}
    `

    const [countRows]: any = await pool.query(
        totalCountQuery,
        params.slice(0, params.length - 2)
    )

    const total = countRows[0].count

    return c.json({
        data: rows,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total
    })

}


export const createProjectController = async (c: any) => {

    const conn = await pool.getConnection();
    
    try {

        const { workspace_id, project_name, project_description, status, project_member } = c.req.valid('json');

        const user = c.get("user"); 

        if (!user.user_id) {
            throw new Error('No user found')
        }

        await conn.beginTransaction();

        const [rows]: any = await conn.query(`
            INSERT INTO 
                project (workspace_id, project_name, project_description, status, created_by)
            VALUES (?, ?, ?, ?, ?)

        `, [workspace_id, project_name, project_description, status, user.user_id]);

        const project_id = rows.insertId;

        if (!project_id) {
            throw new Error('No project id found')
        }

        for (const item of project_member) {
            await conn.query(`
                INSERT INTO
                    project_member (project_id, user_id, role)
                VALUES (?, ?, ?)
            `, [project_id, item.user_id, item.role]);
        }

        // await conn.query(`
        //     INSERT INTO
        //         project_member (project_id, user_id, role)
        //     VALUES (?, ?, ?)
        // `, [project_id, user.user_id, 'manager']);

        await conn.commit();

        return c.json({
            success: true,
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