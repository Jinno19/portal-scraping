import fs from 'fs';

import axios from 'axios';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

const ACCOUNT_EMAIL = process.env.ACCOUNT_EMAIL;
const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USERID = process.env.USERID;
const COOKIE_PATH = "cookies.json";

async function getPage(uri) {
    const day = [];
    const title = [];
    const sig_day = [];
    const sig_title = [];
    const page_uri = [];
    const context = [];
    const tag_list = [];
    const titles_arr = [];
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
    $('#tab2 > .front_news_list > li').each((i, elem) => {
            day[i] = $(elem).find('datetime').text().replace(/[\f\r\t\v]/g, "");
            title[i] = $(elem).find('p > a:nth-child(2), a > p').text().replace(/[\f\r\t\v]/g, "");
            page_uri[i] = 'https://service.cloud.teu.ac.jp' + $(elem).find('p > a:nth-child(2), a').attr('href');
        });
    $('#tab1 > .front_news_list > li').each((i, elem) => {
        sig_day[i] = $(elem).find('datetime').text().replace(/[\f\r\t\v]/g, "");
        sig_title[i] = $(elem).find('p > a:nth-child(2), a > p').text().replace(/[\f\r\t\v]/g, "");
        });
    for (let s = 0; s < page_uri.length; s++) {
        let page_context = (await axios.get(page_uri[s], {
            withCredentials: true, 
            headers: {
                Cookie: cookie,
            }
        }).catch(console.error)).data;
        const context_fragment = [];
        const $2 = cheerio.load(page_context);
        $2('.post > .entry-body > p').each((n, elem) => {
            context_fragment.push($2(elem).text().replace(/[\f\r\n\t\v]/g, ""));
        });
        let fragment_list = context_fragment.filter(v => v.length > 2).join();
        fragment_list = fragment_list.replace(/,/g, "");
        context.push(fragment_list);
        const tag_list = $(`#tab2 > .front_news_list > li:nth-child(${s+1}) > span`).toArray().map((ele, s, arr) => {
            arr = $(ele).text();
            return arr;
        });
        const sig_checker = tag_list.indexOf('重要');
        if (sig_checker == -1) {
            const siglist_checker = sig_title.indexOf(`${title[s]}`);
            if (siglist_checker != -1 && sig_day[`${siglist_checker}`] == day[s]) {
                tag_list.push('重要');
            }
        }
        titles_arr.push({
            day: day[s], 
            title: title[s], 
            uri: page_uri[s],
            tag_list: tag_list,
            context: context[s]
        });
    }
    return titles_arr;
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
    const uri = 'https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/';
    const result_data = await getPage(uri);
    console.log(result_data);
})();