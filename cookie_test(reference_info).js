import axios from "axios";
import fs from "fs";
import puppeteer from "puppeteer";
import cheerio from "cheerio";

const ACCOUNT_EMAIL = process.env.ACCOUNT_EMAIL;
const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const USERID = process.env.USERID;
const COOKIE_PATH = "cookies.json";

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
    console.log(result);
    const $ = cheerio.load(result);
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
    const uri = 'https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=USW0009300-flow';
    const result_data = await getPage(uri)
    console.log(result_data);
})();