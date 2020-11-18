//@ts-check

import fs from 'fs';

import axios from 'axios';
import cheerio from 'cheerio';
import cron from 'node-cron';

import { login, getCookie } from './login.js';

let lectures_arr = [];
let page_number = 1;

async function getLecturePage(uri) {
    await login();
    const cookie = getCookie();

    let response = await axios.get(uri, {
        withCredentials: true, 
        headers: {Cookie: cookie},
    });

    const $ = cheerio.load(response.data);

    let table_number = 13;
    $('.searchTable').each(() => {
        lectures_arr.push({
            date: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(1)`).text().replace(/[\f\n\r\t\v]/g, ""),
            name: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(2) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ""),
            instructor: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(2) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ""),
            department: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(3) > td`).text().replace(/[\f\n\r\t\v]/g, ""),
            grade: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(4) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ""),
            class: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(4) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ""),
            note: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(5) > td`).text().replace(/[\f\n\r\t\v]/g, ""),
            up: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(6) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ""),
            from: $(`#main > .searchTable:nth-child(${table_number}) > tbody > tr:nth-child(6) > td:nth-child(4)`).text().replace(/[\f\n\r\t\v]/g, ""),
        })
        table_number ++;
    })
    if (/次へ/g.test($('.feed_page > a').text()) == true) {
        page_number ++;
        let uri2 = uri + `page/${page_number}/`;
        let result = getLecturePage(uri2);
        return result;
    }
    return lectures_arr;
}

//cron.schedule('0 */10 * * * ', () => {
    (async () => {
        const result_data = await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
        //await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/lecture', result_data);
        console.log(result_data);
    })();
//});