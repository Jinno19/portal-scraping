import fs from 'fs';

import axios from 'axios';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const ACCOUNT_EMAIL = process.env.ACCOUNT_EMAIL;
const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USERID = process.env.USERID;
const COOKIE_PATH = "cookies.json";
let lectures_arr = [];
let page_number = 1;

async function getPage(uri) {
    const json = fs.readFileSync(COOKIE_PATH, 'utf-8');
    const value = JSON.parse(json).find(obj => obj.name === 'auth_tkt').value;
    const cookie = `auth_tkt=${value};`;
    let result = (await axios.get(uri, {
        withCredentials: true, 
        headers: {
            Cookie: cookie,
        }
    }).catch(console.error)).data;
    if(/Google アカウントでログイン/.test(result)) {
        await login();
        result = getPage(uri);
        return result;
    }
    const $ = cheerio.load(result);
    let table_number = 13;
    $('.searchTable').each(() => {
        let lectures_frg = [];
        $('td',`.searchTable:nth-child(${table_number}) > .search_result > tr`).each((i, elem) => {
            lectures_frg.push($(elem).text().replace(/[\f\n\r\t\v]/g, ""));
        })
        table_number ++;
        lectures_arr.push({
            day: lectures_frg[0], 
            name: lectures_frg[1], 
            instructor: lectures_frg[2], 
            department: lectures_frg[3], 
            grade: lectures_frg[4], 
            class: lectures_frg[5], 
            note: lectures_frg[6],  
            up: lectures_frg[7], 
            from: lectures_frg[8]
        })
    })
    const next_checker = $('.feed_page > a').text();
    if (/次へ/g.test(next_checker) == true) {
        page_number ++;
        let uri2 = uri + `page/${page_number}/`;
        result = getPage(uri2);
        return result;
    }
    return lectures_arr;
}

async function login() {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', {waitUntil: 'networkidle0'});
    
    await page.waitForSelector('input#next');
    const email_xpath = '//*[@id="identifierId"]|//*[@id="Email"]';
    await (await page.$x(email_xpath))[0].click();
    await (await page.$x(email_xpath))[0].type(ACCOUNT_EMAIL);
    await page.click('input#next');

    await page.waitForSelector('input#submit');
    const password_xpath = '//*[@id="password"]/div[1]/div/div[1]/input|//*[@id="password"]';
    await (await page.$x(password_xpath))[0].click();
    await (await page.$x(password_xpath))[0].type(ACCOUNT_PASS);
    await page.click('input#submit');
    await page.waitForNavigation({waitUntil: ['load', 'networkidle2']});

    const isLogin = await page.evaluate(()=> {
        const node = document.querySelectorAll('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
        return node.length? false : true;
    });

    if (!isLogin) {
        await page.click('.input_f > tbody > tr:nth-child(2) > td > input');
        await page.type('.input_f > tbody > tr:nth-child(2) > td > input', USERID);
        await page.type('.input_f > tbody > tr:nth-child(3) > td > input', ACCOUNT_PASS);
        await page.click('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
    }

    const afterCookies = await page.cookies();
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(afterCookies));

    await browser.close();
}

(async () => {
    const uri = 'https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/';
    const result_data = await getPage(uri)
    console.log(result_data);
})();