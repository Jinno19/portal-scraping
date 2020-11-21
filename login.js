//@ts-check
import fs from 'fs';

import axios from 'axios';
import AxiosCookieSupport from 'axios-cookiejar-support';
import puppeteer from 'puppeteer';

const COOKIE_PATH = 'cookies.json';

AxiosCookieSupport(axios);

export async function login() {
    process.on('unhandledRejection', console.dir);

    try {
        const Cookie = getCookie();
        const data = await axios.get('https://service.cloud.teu.ac.jp/portal/index', {
            jar: true,    
            withCredentials: true, 
            headers: {cookie: Cookie}
        });
        console.log(data.data);
        if (/Tokyo University of Technology/i.test(data.data)) {
            return;
        }
    } catch {}

    const browser = await puppeteer.launch({
        args: [
        '--lang=ja',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--proxy-server=\'direct://\'',
        '--proxy-bypass-list=*',
    ]});

    const page = await browser.newPage();
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', {waitUntil: 'networkidle0'});

    await page.waitForSelector('input#next');
    const email_xpath = '//*[@id="identifierId"]|//*[@id="Email"]';
    await (await page.$x(email_xpath))[0].click();
    await (await page.$x(email_xpath))[0].type(`${process.env.USER_ID}@edu.teu.ac.jp`);
    let html = await page.$eval('html', item => {
        return item.innerHTML;
    });
    //console.log(html);
    await page.click('input#next');

    await page.waitForSelector('input#submit');
    const password_xpath = '//*[@id="password"]/div[1]/div/div[1]/input|//*[@id="password"]';
    await (await page.$x(password_xpath))[0].click();
    await (await page.$x(password_xpath))[0].type(process.env.PASSWORD);
    await page.click('input#submit');
    await page.waitForNavigation({waitUntil: ['load', 'networkidle2']});

    const isLogin = await page.evaluate(() => {
        const node = document.querySelectorAll('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
        return !node.length;
    });

    if (!isLogin) {
        await page.click('.input_f > tbody > tr:nth-child(2) > td > input');
        await page.type('.input_f > tbody > tr:nth-child(2) > td > input', process.env.USER_ID);
        await page.type('.input_f > tbody > tr:nth-child(3) > td > input', process.env.PASSWORD);
        await page.click('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
    }

    const afterCookies = await page.cookies();
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(afterCookies));

    await browser.close();
}

export function getCookie() {
    try {
        return [JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf-8'))
        .find(obj => obj.name === 'auth_tkt')]
        .map(obj => `${obj.name}=${obj.value};`)[0];
    } catch {
        return '';
    }
}