import log4js from 'log4js';
import puppeteer from 'puppeteer';

const logger = log4js.getLogger('main');
logger.level = 'all';

export async function main() {
    await login();
    const app = await puppeteer.launch({
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
    const page = (await app.pages())[0];
    await page.goto('https://service.cloud.teu.ac.jp/portal/index', { waitUntil: ['load', 'networkidle2'] });
    logger.info(await page.$eval('title', elm => elm.textContent));
    await app.close();
}

//main();

async function login() {
    const browser = await puppeteer.launch({
        args: [
            '--window-size=1280,720',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--proxy-server=\'direct://\'',
            '--proxy-bypass-list=*',
            `--user-data-dir=${process.cwd()}/data`,
        ],
    });

    const page = (await browser.pages())[0];
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', { waitUntil: 'networkidle0' });
    if (await page.$eval('html', element => /Tokyo University of Technology/img.test(element.textContent))) {
        logger.debug('already logged in');

        await browser.close();
        return;
    }

    logger.debug('logging in');

    await page.waitForSelector('input[type="email"]', { visible: true });

    await page.click('input[type="email"]');
    await page.type('input[type="email"]', `${process.env.USER_ID}@edu.teu.ac.jp`);
    try {
        await page.click('#identifierNext > div > button');
    } catch {
        await page.click('input#next');
    }

    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.click('input[type="password"]');
    await page.type('input[type="password"]', process.env.PASSWORD);
    try {
        await page.click('#passwordNext > div > button');
    } catch {
        await page.click('input#submit');
    }
    await page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] });

    const isLogin = await page.evaluate(() => {
        // eslint-disable-next-line no-undef
        const node = document.querySelectorAll('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
        return !node.length;
    });

    if (!isLogin) {
        await page.click('.input_f > tbody > tr:nth-child(2) > td > input');
        await page.type('.input_f > tbody > tr:nth-child(2) > td > input', process.env.USER_ID);
        await page.type('.input_f > tbody > tr:nth-child(3) > td > input', process.env.PASSWORD);
        await page.click('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
    }

    logger.debug('logged in');

    await browser.close();
}
