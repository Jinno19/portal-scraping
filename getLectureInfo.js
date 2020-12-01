//import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
//import logger from './logger.js';
//import cron from 'node-cron';
//import axios from 'axios';

import { main } from './login.js';
import { app } from './main.js';


export async function getLecturePage(uri) {
    await main();

    const lecturesArr = [];

    const app2 = await app;
    const page = (await app2.pages())[0];
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
  
    await app2.close();
    postAxios(lecturesArr);
    return lecturesArr;
}

async function postAxios(arr) {
    try {
        // eslint-disable-next-line no-unused-vars
        //let res = await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/lecture', arr);
        console.log(arr);
    } catch (err) {
        console.error(err + '\ncontinue');
        if (/429/.test(err)) {
            await postAxios(arr);
        }
    }
}

//cron.schedule('0 */10 * * * ', () => {
(async () => {
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
})();
//});
