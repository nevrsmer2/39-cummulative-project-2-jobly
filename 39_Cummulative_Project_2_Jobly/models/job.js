"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/* Job Class and  static class methods */

class Job {

    /** Creates a new job listing that includes { title, salary, equity, companyHandle }.
     * it returns the { id, title, salary, equity, companyHandle } of the new job.
 **/

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
                             salary,
                             equity,
                             company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [
                data.title,
                data.salary,
                data.equity,
                data.companyHandle,
            ]);
        let job = result.rows[0];

        return job;
    };

    /** Returns  [{ id, title, salary, equity, companyHandle, companyName }, ...] for  all jobs in DB.  Jobs can be filtered by title, hasEquity and/or minSalaray.
     * */

    static async findAll({ minSalary, hasEquity, title } = {}) {
        let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "companyHandle",
                        c.name AS "companyName"
                 FROM jobs j 
                   LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let whereExpressions = [];
        let queryValues = [];


        //Filteriing logic for jobs.  If the client does not use filtering, all jobs are returned.  Client can filter by one or by all filtering options.

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`);
        };

        if (hasEquity === true) {
            whereExpressions.push(`equity > 0`);
        };

        if (title !== undefined) {
            queryValues.push(`%${title}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        };

        if (whereExpressions.length > 0) {
            query += " WHERE " + whereExpressions.join(" AND ");
        };

        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    };


    /* Returns a specific job based on id in an object --> { id, title, salary, equity, companyHandle, company }.  If id non existent, it returns an error.
    */

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesRes.rows[0];

        return job;
    };


    /** Update job listing based on job id.
     * { title, salary, equity } can be updated individualle or as a group
     * If the job id is not found, it returns a notFound error.
 * 
*/

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    };

    /** Deletes a job listing based on the job's id.
     * If the id is non existent, it returns a notFound error
     **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`, [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    };
};


module.exports = Job;
