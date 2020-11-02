import fs from 'fs';
import puppeteer from 'puppeteer';

const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USERID = process.env.USERID;
const REFERENCEINFORMATION_URL = "https://kyo-web.teu.ac.jp/campusweb/";
const SYLLABUS_URL = "https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=SYW0001000-flow";
const CS_Reference = [];
const BS_Reference = [];
const ES_Reference = [];
const MS_Reference = [];

const COOKIES_PATH = 'cookies.json';

/*
async function getReference() {
    const number = await page.evaluate(() => {
        const lec_number = Array.from(document.querySelectorAll('body > b:nth-child(5)'));
        const lecture_number = lec_number[0].innerHTML.replace(/[^0-9]/g, "");
        return lecture_number
    })
    let title = await page.evaluate(() => {
        let lec_title = Array.from(document.querySelectorAll('#tabs-1 > table > tbody > tr > td:nth-child(6)'), 
        a => a.textContent;
        return lec_title;
    });
    for(let i = 1; i < number; i++) {
        await page.click(`body > .normal > tbody > tr:nth-child(${number}) > td:nth-child(8) > input[type=button]`);
        await page.click('#tabs > ul > li:nth-child(2) > a');
        let ref_title = await page.evaluate(() => {
            let rTitle = document.querySelectorAll('#tabs-2 > table > tbody > tr:nth-child(9) > td');
            return rTitle[0].textContent;
        });

    }
}
*/

(async () => {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({headless: false});
    
    const page = await browser.newPage();

    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    for (let cookie of cookies) {
        await page.setCookie(cookie);
    }

    await page.goto(REFERENCEINFORMATION_URL);

    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]', USER_ID);
    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]', ACCOUNT_PASS);
    await page.click('body > center > form > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > input[type=image]');

    /*
    let page_url = await page.url();
    let frames = await page.frames();
    console.log(frames);
    const frame_567 = frames.find(f => f.url() === page_url);

    const clicker = await frame_567.evaluate(() => {
        const menu = document.querySelector('#idForChangeMenu > frame:nth-child(1)');
        const syllabus_link = menu.contentWindow.document.querySelector('body > table > tbody > tr:nth-child(10) > td > table > tbody > tr:nth-child(2) > td > a > span');
        return syllabus_link;
    });

    await page.click('#idForChangeMenu > frame:nth-child(1)).contentWindow.document.querySelector(body > table > tbody > tr:nth-child(10) > td > table > tbody > tr:nth-child(2) > td > a > span');
    */

    await page.goto(SYLLABUS_URL);

    let go_Reference = await page.evaluate(() => {
        document.querySelector('#idForChangeMenu > frame:nth-child(2)').contentWindow.refer(2020, 'CS', 'CS0301', 'ja_JP');
    });

    await page.waitForSelector('table #jikanwariShozokuCode');

    await page.click('table #jikanwariShozokuCode');
    await page.select('table #jikanwariShozokuCode', 'CS');

    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.select('table > tbody > tr:nth-child(11) > td > select', '500');
    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.click('#jikanwariSearchForm > table > tbody > tr:nth-child(12) > td > p > input[type=button]');
    await page.waitForSelector('html > body > .normal > tbody > tr');
    //const CS_result = 

})();