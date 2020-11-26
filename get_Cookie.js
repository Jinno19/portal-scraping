import fs from 'fs';
import puppeteer from 'puppeteer';

const INFORMATION_URL = 'https://service.cloud.teu.ac.jp/portal/inside';

const COOKIES_PATH = 'cookies.json';


export async function getCookie() {

    process.on('unhandledRejection', console.dir);

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
        ],
    });

    const page = await browser.newPage();

    await page.goto(INFORMATION_URL, { waitUntil: 'networkidle0' });

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
        // eslint-disable-next-line
        const node = document.querySelectorAll('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
        return node.length? false : true;
    });

    if (!isLogin) {
        await page.click('.input_f > tbody > tr:nth-child(2) > td > input');
        await page.type('.input_f > tbody > tr:nth-child(2) > td > input', process.env.USER_ID);
        await page.type('.input_f > tbody > tr:nth-child(3) > td > input', process.env.PASSWORD);
        await page.click('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
    }

    const afterCookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(afterCookies));

    await browser.close();
    console.log('complete.');
}
