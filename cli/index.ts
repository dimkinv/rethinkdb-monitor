import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import * as rethink from '../rethink';


const screen = blessed.screen({
  debug: console.log,
  dump: './console.log'
});
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

var table = contrib.table(
  {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    electedBg: 'blue',
    interactive: true,
    label: 'Tables',
    width: '70%',
    height: '100%',
    border: { type: "line", fg: "cyan" },
    columnSpacing: 10, //in chars
    columnWidth: [23, 18, 18] /*in chars*/
  })
screen.append(table);
table.focus();
screen.render();

export async function initTables(dbName: string) {
  const tablesNames = await rethink.getTables(dbName);
  const data = tablesNames.map(tableName => {
    return [tableName, Math.random().toString(), Math.random().toString()];
  });

  table.setData(
    {
      headers: ['Table Name', 'Read/s', 'Write/s'],
      data: data
    });


  setInterval(() => {
    const rowIndex = getRandom(data.length - 1);
    data[rowIndex][1] = Math.random().toString();
    table.setData(
      {
        headers: ['Table Name', 'Read/s', 'Write/s'],
        data: data
      });
    screen.render();
  }, 100);

  screen.render()
}

function getRandom(max: number) {
  return Math.floor(Math.random() * max);
}
