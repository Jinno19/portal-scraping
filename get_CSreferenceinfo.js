import fs from 'fs';
import util from 'util';

import puppeteer from 'puppeteer';

const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USER_ID = process.env.USER_ID;
const REFERENCEINFORMATION_URL = "https://kyo-web.teu.ac.jp/campusweb/";
const SYLLABUS_URL = "https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=SYW0001000-flow";
const CS_Reference = [];
const BS_Reference = [];
const ES_Reference = [];
const MS_Reference = [];

const COOKIES_PATH = 'cookies.json';

async function getReference(page) {
    let title = await page.evaluate(() => {
        let titles = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(6)'), 
        a => a.textContent.replace(/[\n]/g, ""));
        return titles;
    });
    const Lecture_length = await page.evaluate(() => {
        let lec_length = document.querySelector('body > b:nth-child(5)').textContent.replace( /[^0-9]/g, "");
        return parseInt(lec_length);
    });
    for(let i = 1; i <= Lecture_length; i++) {
        await page.click(`body > .normal > tbody > tr:nth-child(${i}) > td:nth-child(8) > input`);
        await page.waitForSelector('#tabs > ul > li:nth-child(2) > a');
        await page.click('#tabs > ul > li:nth-child(2) > a');
        await page.waitForSelector('#tabs-2 > table > tbody > tr:nth-child(9) > th');
        let ref_title = await page.evaluate(() => {
            let isReference = document.querySelector('#tabs-2 > table > tbody > tr:nth-child(9) > th').textContent.replace(/[\n]/g, "").trim();
            if (isReference == "参考書") {
                let rTitle = document.querySelector('#tabs-2 > table > tbody > tr:nth-child(9) > .syllabus-break-word');
                return rTitle.textContent.replace(/[\n]/g, "").trim();
            } else {
                return '参考書の指定はありません。';
            }
        });
        CS_Reference.push({
            title: title[i-1], 
            Reference: ref_title
        })
        await page.goBack();
    }
    return CS_Reference;
}

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


    await page.goto(SYLLABUS_URL);

    await page.waitForSelector('table #jikanwariShozokuCode');

    await page.click('table #jikanwariShozokuCode');
    await page.select('table #jikanwariShozokuCode', 'CS');

    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.select('table > tbody > tr:nth-child(11) > td > select', '500');
    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.click('#jikanwariSearchForm > table > tbody > tr:nth-child(12) > td > p > input[type=button]');
    await page.waitFor(3000);
    const CS_result = await getReference(page);
    console.log(util.inspect(CS_result, {maxArrayLength: null}));
    
    await browser.close();
})();