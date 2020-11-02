import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

const ACCOUNT_EMAIL = process.env.ACCOUNT_EMAIL;
const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USERID = process.env.USERID;
const COOKIE_PATH = "cookies.json";

async function getPage(uri) {
    const title = [];
    const page_uri = [];
    const context = [];
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
            title[i] = $(elem).find('p > a:nth-child(2), a > p').text().replace(/[\f\r\t\v]/g, ""), 
            page_uri[i] = 'https://service.cloud.teu.ac.jp' + $(elem).find('p > a:nth-child(2), a').attr('href')
    })
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
        })
        let fragment_list = context_fragment.filter(v => v.length > 2).join();
        fragment_list = fragment_list.replace(/,/g, "");
        context.push(fragment_list);
        titles_arr.push({
            title: title[s], 
            uri: page_uri[s], 
            context: context[s]
        });
    }
    return titles_arr;
}

async function login() {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', {waitUntil: 'networkidle0'});

    await page.waitFor(2500);
    await page.click('#identifierId');
    await page.type('#identifierId', ACCOUNT_EMAIL);
    await page.click('.qhFLie > #identifierNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .VfPpkd-LgbsSe > .VfPpkd-RLmnJb');

    await page.waitFor(3500);
    await page.click('#password > .aCsJod > .aXBtI > .Xb9hP > .whsOnd');
    await page.type('#password > .aCsJod > .aXBtI > .Xb9hP > .whsOnd', ACCOUNT_PASS);
    await page.click('.qhFLie > #passwordNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .VfPpkd-LgbsSe > .VfPpkd-RLmnJb');
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
    const result_data = await getPage(uri)
    console.log(result_data);
})();