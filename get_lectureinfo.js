import fs from 'fs';
import puppeteer from 'puppeteer';

const LECTUREINFORMATION_URL = "https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/";

const COOKIES_PATH = 'cookies.json';


async function get_lecture_data(page) {
    let number = 1;
    const lecture_box = [];
    while (true) {
        let touring_url = LECTUREINFORMATION_URL + `page/${number}/`;
        await page.goto(touring_url);
        const isTable = await page.evaluate(() => {
            const table = document.querySelectorAll('.searchTable');
            return table.length;
        });
        if (isTable != 0) {
            const lecture_data = await page.evaluate(() => {
                const table = document.getElementsByClassName('searchTable');
                return Array.from(table, row => {
                    const columns = row.querySelectorAll('td');
                    return Array.from(columns, column => column.textContent.replace(/[\f\n\r\t\v]/g, ""));
                })
            })
            lecture_box.push(lecture_data);
            number ++;
        } else {
            break;
        }
    }
    return lecture_box;
}

(async () => {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        headless: false
    });
    
    const page = await browser.newPage();

    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    for (let cookie of cookies) {
        await page.setCookie(cookie);
    }

    const lecture_info = await get_lecture_data(page);

    console.log(lecture_info);
   
    await browser.close();
})();