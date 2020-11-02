import puppeteer from "puppeteer";
import fs from "fs";

const ACCOUNT_EMAIL = 'c01171576b@edu.teu.ac.jp';
const ACCOUNT_PASS = 'ibE7nx3G%';
const INFORMATION_URL = "https://service.cloud.teu.ac.jp/portal/inside";
const USERID = 'c01171576b'

const COOKIES_PATH = 'cookies.json';

const requireEnvs = [
    ACCOUNT_EMAIL,
    ACCOUNT_PASS,
    INFORMATION_URL,
    USERID
];


(async () => {
    for (let requireEnv of requireEnvs) {
        if (requireEnv == undefined) {
            console.log('local env is not set.');
            return;
        }
    }

    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({headless: false});

    const page = await browser.newPage();

    await page.goto(INFORMATION_URL, {waitUntil: 'networkidle0'});

    //メールアドレス入力
    await page.waitForSelector('#identifierId');
    await page.click('#identifierId');
    await page.type('#identifierId', ACCOUNT_EMAIL);
    await page.click('.qhFLie > #identifierNext > .VfPpkd-dgl2Hf-ppHlrf-sM5MNb > .VfPpkd-LgbsSe > .VfPpkd-RLmnJb');

    //パスワード入力
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
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(afterCookies));

    await browser.close();
    console.log('complete.')
})();