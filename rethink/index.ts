import * as rethink from 'rethinkdb';

let conn: rethink.Connection;
export let tables: string[];
export function init() {
    return new Promise(async (resolve, reject) => {
        conn = await rethink.connect({
            host: '135.76.2.144',
            user: 'admin',
            password: '123456',
            db: 'rethinkdb'
        });
        // const statsCursor = await rethink.table('stats').changes().run(conn);
        // statsCursor.each((err, item)=>{
        // });

        tables = await rethink.db('seta2').tableList().run(conn);
        resolve(tables);
    });
}

export async function getTables(dbName: string) {
    return rethink.db(dbName).tableList().run(conn);
}