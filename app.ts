import * as rethink from './rethink';
import * as  cli from './cli';
rethink.init()
  .then(async () => {
    rethink.subscribeToClusterData((err, data): boolean => {
      if (err) {
        process.exit(-1);
        return false;
      }

      cli.writeCluster(data);
      return true;
    });

    const tables = await rethink.getTables('seta2');
    rethink.subscribeToTableData((err, data): boolean => {
      if (err) {
        process.exit(-1);
        return false;
      }

      cli.writeTableStatistics(tables, data);
      return true;
    });
  });