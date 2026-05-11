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

function encodeCursor(data: any) {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

function decodeCursor(cursor: string) {
  return JSON.parse(Buffer.from(cursor, 'base64').toString())
}


export const getPaginatedProjectController = async (c: any) => {

     const workspace_id = c.req.param('workspace_id');

    const limit = Number(c.req.query('limit') || 10)

    const status = c.req.query('status')
    const search = c.req.query('search')

    // asc | desc
    const sort = (c.req.query('sort') || 'desc').toLowerCase()

    const cursor = c.req.query('cursor')

    let sql = `
        SELECT 
            p.*,
            w.workspace_name
        FROM project p
        LEFT JOIN workspace w 
            ON p.workspace_id = w.workspace_id
        WHERE w.workspace_id = ?
    `

    const params: any[] = [workspace_id];

    if (status) {
        sql += ` AND status = ?`
        params.push(status)
    }

     if (search) {
        sql += ` AND LOWER(project_name) LIKE ?`
        params.push(`%${search.toLowerCase()}%`)
    }

    if (cursor) {
        const decoded = decodeCursor(cursor)

        if (sort === 'desc') {
        sql += `
            AND (
                created_at < ?
                OR (
                    created_at = ?
                    AND project_id < ?
                )
            )
        `

        params.push(
            decoded.created_at,
            decoded.created_at,
            decoded.project_id
        )
        } else {
        sql += `
            AND (
                created_at > ?
                OR (
                    created_at = ?
                    AND project_id > ?
                )
            )
        `

        params.push(
            decoded.created_at,
            decoded.created_at,
            decoded.project_id
        )
        }
    }

    // STABLE ORDER
    sql += `
        ORDER BY created_at ${sort}, project_id ${sort}
        LIMIT ${limit}
    `

    params.push(limit + 1)

    // fake db result
    const [rows]: any[] = await pool.query(sql, params)

    let nextCursor: string | null = null

    // detect next page
    const hasMore = rows.length > limit

    if (hasMore) {
        const lastItem = rows[limit - 1]

        nextCursor = encodeCursor({
            created_at: lastItem.created_at,
            project_id: lastItem.project_id,
        })

        rows.pop()
    }

    return c.json({
        data: rows,
        pagination: {
            limit,
            next_cursor: nextCursor,
            has_more: hasMore,
        },
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