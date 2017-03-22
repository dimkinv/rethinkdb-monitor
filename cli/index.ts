import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import * as rethink from '../rethink';

import { TableDataResult } from '../rethink';


const screen = blessed.screen({
  // dump: './console.log',
  // debug: console.log
});
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })
// var table = contrib.table(
//   {
//     keys: true,
//     fg: 'white',
//     selectedFg: 'white',
//     electedBg: 'blue',
//     interactive: true,
//     label: 'Tables',
//     width: '70%',
//     height: '100%',
//     border: { type: "line", fg: "cyan" },
//     columnSpacing: 10, //in chars
//     columnWidth: [23, 18, 18] /*in chars*/
//   })
// screen.append(table);
// table.focus();
// screen.render();

// export async function initTables(dbName: string) {
//   const tablesNames = await rethink.getTables(dbName);
//   const data = tablesNames.map(tableName => {
//     return [tableName, Math.random().toString(), Math.random().toString()];
//   });

//   table.setData(
//     {
//       headers: ['Table Name', 'Read/s', 'Write/s'],
//       data: data
//     });


//   setInterval(() => {
//     const rowIndex = getRandom(data.length - 1);
//     data[rowIndex][1] = Math.random().toString();
//     table.setData(
//       {
//         headers: ['Table Name', 'Read/s', 'Write/s'],
//         data: data
//       });
//     screen.render();
//   }, 100);

//   screen.render()
// }

const clusterBar = grid.set(0, 0, 4, 4, contrib.bar, {
  label: 'Cluster Statistics',
  maxHeight: 1,
  width: 500,
  barSpacing: 2,
  barWidth: 10,
  border: { type: "line", fg: "cyan" }
})

const clusterBarTitles = ['Connections', 'A. Clients', 'Qeries/s', 'R. Docs/s', 'W. Docs/s'];
export function writeCluster(clusterData: any) {
  const values = Object.values(clusterData).map(val => val.toFixed(2));
  clusterBar.setData({
    titles: clusterBarTitles,
    data: values
  });
  screen.render();
}


const tableStatisticsTable = grid.set(0, 4, 12, 8, contrib.table, {
  keys: true,
  fg: 'white',
  selectedFg: 'white',
  electedBg: 'blue',
  interactive: true,
  label: 'Tables Statistics',
  border: { type: "line", fg: "cyan" },
  columnSpacing: 10, //in chars
  columnWidth: [30, 10, 10, 10, 10, 10] /*in chars*/
});
tableStatisticsTable.focus();
let statisticsTableRows: StatisticsTableRows;
export function writeTableStatistics(tables: string[], tablesDataStatistics: TableDataResult) {
  if (!statisticsTableRows) {
    initStatisticsTableRows(tables);
  }

  const rowToBeChanged = statisticsTableRows.rows.find(row => {
    return row[0] === tablesDataStatistics.name;
  });

  if (!rowToBeChanged) {
    return;
  }
  rowToBeChanged[1] = tablesDataStatistics.readBytesPerS;
  rowToBeChanged[2] = tablesDataStatistics.writtenBytesPerS;
  rowToBeChanged[3] = tablesDataStatistics.readDocsPerS;
  rowToBeChanged[4] = tablesDataStatistics.writtenDocsPerS;
  rowToBeChanged[5] = tablesDataStatistics.cacheSizeInBytes;

  tableStatisticsTable.setData({
    headers: statisticsTableRows.headers,
    data: statisticsTableRows.rows
  });

  screen.render();
}

function initStatisticsTableRows(tables: string[]) {
  statisticsTableRows = new StatisticsTableRows();
  statisticsTableRows.headers = ['Table Name', 'R. Bytes/s', 'W. Bytes/s', 'R. Docs/s', 'W Docs/s', 'Cache'];
  tables.forEach(tableName => {
    statisticsTableRows.rows.push([tableName, 0, 0, 0, 0, 0]);
  });
}

function getRandom(max: number) {
  return Math.floor(Math.random() * max);
}

class StatisticsTableRows {
  headers: string[];
  rows: (string | number)[][]

  constructor() {
    this.headers = [];
    this.rows = [];
  }
}