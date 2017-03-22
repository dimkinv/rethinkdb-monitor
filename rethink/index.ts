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
        
        tables = await rethink.db('seta2').tableList().run(conn);
        resolve(tables);
    });
}

export async function getTables(dbName: string) {
    return rethink.db(dbName).tableList().run(conn);
}

export async function subscribeToClusterData(callback: (err: Error, res: any) => boolean) {
    const cursor = await rethink.db('rethinkdb').table('stats').getAll(['cluster']).changes().run(conn);
    cursor.each((err, res) => {
        if (err) {
            callback(err, null);
            return;
        }

        callback(null, res.new_val.query_engine);
    });
}

export async function subscribeToTableData(callback: (err: Error, res: TableDataResult) => boolean) {
    const cursor = await rethink.db('rethinkdb').table('stats').filter(stat => {
        return stat('id').contains('table_server');
    }).changes().run(conn);

    cursor.each((err, res) => {
        if (err) {
            callback(err, null);
            return;
        }

        const result: TableDataResult = {
            cacheSizeInBytes: res.new_val.storage_engine.cache.in_use_bytes,
            name: res.new_val.table,
            readBytesPerS: res.new_val.storage_engine.disk.read_bytes_per_sec,
            writtenBytesPerS: res.new_val.storage_engine.disk.written_bytes_per_sec,
            readDocsPerS: res.new_val.query_engine.read_docs_per_sec,
            writtenDocsPerS: res.new_val.query_engine.written_docs_per_sec
        };
        callback(null, result);
    });
}

export interface TableDataResult {
    name: string;
    writtenDocsPerS: number;
    readDocsPerS: number;
    writtenBytesPerS: number;
    readBytesPerS: number;
    cacheSizeInBytes: number;
}