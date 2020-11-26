import fs from 'fs';
import { performance } from 'perf_hooks';

import puppeteer from 'puppeteer';

const LECTUREINFORMATION_URL = 'https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/';

const COOKIES_PATH = 'cookies.json';

async function getLectureData(page) {
    let number = 1;
    const lectureBox = [];
    // eslint-disable-next-line
    while (true) {
        let touringUrl = LECTUREINFORMATION_URL + `page/${number}/`;
        await page.goto(touringUrl);

        const pageURL = await page.url();
        if (/google.com/i.test(pageURL)) {
            await getCookie(page);
        }

        const isTable = await page.evaluate(() => {
            // eslint-disable-next-line
            const table = document.querySelectorAll('.searchTable');
            return table.length;
        });
        if (isTable !== 0) {
            const lectureData = await page.evaluate(() => {
                // eslint-disable-next-line
                const table = document.getElementsByClassName('searchTable');
                return Array.from(table, row => {
                    const columns = row.querySelectorAll('td');
                    return Array.from(columns, column => column.textContent.replace(/[\f\n\r\t\v]/g, ''));
                });
            });
            lectureBox.push(lectureData);
            number ++;
        } else {
            break;
        }
    }
    return lectureBox;
}

async function getCookie(page) {
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

    console.log('complete.');
}

(async () => {
    const start = performance.now();
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        args: [
            '--window-size=1280,720',
            '--lang=ja',
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

    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    for (let cookie of cookies) {
        await page.setCookie(cookie);
    }

    const lectureInfo = await getLectureData(page);

    console.log(lectureInfo);
   
    await browser.close();
    const end = performance.now();
    console.log(end - start);
})();
