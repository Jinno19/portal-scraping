import puppeteer from 'puppeteer';

export const app = puppeteer.launch({
    args: [
        '--window-size=1280,720',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
        '--proxy-server=\'direct://\'',
        '--proxy-bypass-list=*',
        `--user-data-dir=${process.cwd()}/data`,
    ],
});
