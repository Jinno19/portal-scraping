//@ts-check

import axios from 'axios';
import cheerio from 'cheerio';
//import cron from 'node-cron';

import { main } from './login.js';

let lecturesArr = [];
let pageNumber = 1;

async function getLecturePage(uri) {
    await main();

    let response = await axios.get(uri);

    const $ = cheerio.load(response.data);

    let tableNumber = 13;
    $('.searchTable').each(() => {
        lecturesArr.push({
            date: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(1)`).text().replace(/[\f\n\r\t\v]/g, ''),
            name: $(`#main > .searchTable:nth-child(${tableNumber}) > tbody > tr:nth-child(2) > td:nth-child(2)`).text().replace(/[\f\n\r\t\v]/g, ''),
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
        pageNumber ++;
        let uri2 = uri + `page/${pageNumber}/`;
        let result = getLecturePage(uri2);
        return result;
    }
    return lecturesArr;
}

//cron.schedule('0 */10 * * * ', () => {
(async () => {
    const resultData = await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
    //await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/lecture', result_data);
    console.log(resultData);
})();
//});
