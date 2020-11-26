import fs from 'fs';
import puppeteer from 'puppeteer';

const COOKIE_PATH = 'cookies.json';

export async function login() {
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
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', { waitUntil: 'networkidle0' });

    await page.waitForSelector('input#next');
    const emailXpath = '//*[@id="identifierId"]|//*[@id="Email"]';
    await (await page.$x(emailXpath))[0].click();
    await (await page.$x(emailXpath))[0].type(`${process.env.USER_ID}@edu.teu.ac.jp`);
    await page.click('input#next');

    await page.waitForSelector('input#submit');
    const passwordXpath = '//*[@id="password"]/div[1]/div/div[1]/input|//*[@id="password"]';
    await (await page.$x(passwordXpath))[0].click();
    await (await page.$x(passwordXpath))[0].type(process.env.PASSWORD);
    await page.click('input#submit');
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
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(afterCookies));

    console.log('complete.');
    await browser.close();
}
