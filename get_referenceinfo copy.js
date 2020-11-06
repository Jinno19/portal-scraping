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
    for(let i = 1; i < title.length; i++) {
        const page_moving = await page.evaluate(() => {
            let Sdl_codes = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(5)'), 
            a => a.textContent.replace(/[\n]/g, ""));
            refer('2020', 'CS', 'C21101', 'ja_JP');
            (window.onload = function () {
                let tabs_link = document.querySelector('#tabs > ul > li:nth-child(2) > a');
                tabs_link.click();
            })();
        });
        page_moving;
        //await page.click('#tabs > ul > li:nth-child(2) > a');
        let ref_title = await page.evaluate(() => {
            let rTitle = document.querySelector('#tabs-2 > table > tbody > tr:nth-child(9) > .syllabus-break-word');
            return rTitle.textContent;
        });
        CS_Reference.push({
            title: title[i], 
            Reference: ref_title
        })
    }
    return CS_Reference;
}

async function refer(nendo, jscd, jcd, locale) {
    var f = document.ReferForm;

    f.nendo.value = nendo;
    f.jikanwariShozokuCode.value = jscd;
    f.jikanwaricd.value = jcd;
    f.locale.value = locale;

    f.submit();
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
    await page.waitFor(4000);
    const CS_result = await getReference(page);
    console.log(util.inspect(CS_result, {maxArrayLength: null}));
    
    await browser.close();
})();