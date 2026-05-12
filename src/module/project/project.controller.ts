import { pool } from "../../config/db.js";
import type { Project } from "./project.model.js";






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
            w.workspace_name
        FROM project p
        JOIN workspace w
            ON w.workspace_id = p.workspace_id
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

        const { workspace_id, project_name, project_description, status } = c.req.valid('json');

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