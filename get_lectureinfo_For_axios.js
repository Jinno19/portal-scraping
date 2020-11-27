import fs from 'fs';
import { performance } from 'perf_hooks';

import axios from 'axios';
import cheerio from 'cheerio';
//import cron from 'node-cron';

import { login } from './cookiesLogin.js';

const COOKIE_PATH = 'cookies.json';

let lecturesArr = [];
let pageNumber = 1;

async function getLecturePage(uri) {

    const json = fs.readFileSync(COOKIE_PATH, 'utf-8');
    const value = JSON.parse(json).find(obj => obj.name === 'auth_tkt').value;
    const cookie = `auth_tkt=${value};`;

    let response = (await axios.get(uri, {
        withCredentials: true,
        headers: {
            Cookie: cookie,
        }, 
    }).catch(console.error));

    if (/Google アカウントでログイン/.test(response.data)) {
        await login();
        response = getLecturePage(uri);
        return response;
    }
    const $ = cheerio.load(response.data);

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

    postAxios(lecturesArr);
    
    if (/次へ/g.test($('.feed_page > a').text()) === true) {
        pageNumber ++;
        let uri2 = uri + `page/${pageNumber}/`;
        let result = getLecturePage(uri2);
        return result;
    }
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
    const start = performance.now();
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
    const end = performance.now();
    console.log(end - start);
})();
//});
