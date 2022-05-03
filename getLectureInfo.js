import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
//import logger from './logger.js';
//import cron from 'node-cron';
import axios from 'axios';

import { main } from './login.js';

export async function getLecturePage(uri) {
    await main();

    const lecturesArr = [];

    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
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
            `--user-data-dir=${process.cwd()}/data`,
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    await page.goto(uri);
    let html = await page.$eval('html', html => {
        return html.innerHTML;
    });
    const $ = cheerio.load(html);

    let tableNumber = 13;
    $('.searchTable').each(() => {
        lecturesArr.push({
            date: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(1)`).text().replace(/[\f\n\r\t\v]/g, ''),
            title: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(2) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ''),
            instructor: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(2) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ''),
            department: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(3) > td`).text().replace(/[\f\n\r\t\v]/g, ''),
            grade: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(4) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ''),
            class: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(4) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ''),
            note: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(5) > td`).text().replace(/[\f\n\r\t\v]/g, ''),
            up: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(6) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ''),
            from: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(6) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ''),
        });
        tableNumber ++;
    });
    
    if (/次へ/g.test($('.feed_page > a').text()) === true) {
        tableNumber ++;
        let uri2 = uri + `page/${tableNumber}/`;
        let result = getLecturePage(uri2);
        return result;
    }
  
    await browser.close();
    postAxios(lecturesArr);
    return '';
}

async function postAxios(arr) {
    try {
        await axios.post(process.env.POSTURL_LEC, arr);
        console.log(arr);
    } catch (err) {
        console.error(err + '\ncontinue');
        if (/429/.test(err)) {
            await postAxios(arr);
        }
    }
}

/*
(async () => {
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
})();
*/
