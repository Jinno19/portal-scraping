import cron from 'node-cron';

cron.schedule('* * * * *', () => console.log('毎分実行'));
