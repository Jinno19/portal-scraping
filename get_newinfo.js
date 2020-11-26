import fs from 'fs';
import { performance } from 'perf_hooks';

import puppeteer from 'puppeteer';

const INFORMATION_URL = 'https://service.cloud.teu.ac.jp/portal/inside';

const COOKIES_PATH = 'cookies.json';

async function getData(page, url) {
    await page.goto(url);
    let getObject = await page.evaluate(() => {
        // eslint-disable-next-line
        let data = document.querySelectorAll('.post > .entry-body > p');
        const Stlist = [];
        for (let i = 0; i < data.length; i++) {
            Stlist.push(data[i].textContent);
        }
        return Stlist;
    });
    return getObject;
}

async function getInfomation() {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        args: [
            '--window-size=1280,720',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--proxy-server=\'direct://\'',
            '--proxy-bypass-list=*',
        ],
    });

    const page = await browser.newPage();

    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    for (let cookie of cookies) {
        await page.setCookie(cookie);
    }

    await page.goto(INFORMATION_URL, { waitUntil: 'domcontentloaded' });

    const pageURL = await page.url();
    if (/google.com/i.test(pageURL)) {
        await getCookie(page);
    }

    await page.waitFor(2000);
    let frames = await page.frames();
    const frame567 = frames.find(f => f.url() === 'https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
    await frame567.waitForSelector('#post-169 > div > ul > li:nth-child(2) > a');
    await frame567.click('#post-169 > div > ul > li:nth-child(2) > a');

    await frame567.waitFor(3000);

    const articleList = await frame567.evaluate(() => {
        let l = [];
        // eslint-disable-next-line
        let tmpList = document.querySelectorAll('#tab2 > .front_news_list > li > a, #tab2 > .front_news_list > li > p > a:nth-child(2)');
        tmpList.forEach(e => {
            if (!e.textContent.trim()) {
                return;
            }
            l.push({
                title: e.textContent.trim(),
                uri: e.href,
            });
        });

        return l;
    });


    const hrefs = await frame567.evaluate(() =>
    // eslint-disable-next-line
        Array.from(document.querySelectorAll('#tab2 > .front_news_list > li > a'),
            a => a.getAttribute('href'),
        ),
    );

    const url = hrefs.map(href => {
        return 'https://service.cloud.teu.ac.jp' + href;
    });
    
 
    const sentence = [];

    for (let i = 0; i < hrefs.length; i++) {
        let result = await getData(page, url[i]);
        sentence.push(result);
    }

    const csInfo = [];

    for (let s = 0; s < sentence.length; s++) {
        csInfo.push({
            title: articleList[s].title.toString().replace(/[\n\f\r\t\v]/g, ''),
            uri: articleList[s].uri.toString().replace(/[\n\f\r\t\v]/g, ''), 
            sentence: sentence[s].toString().replace(/[\n\f\r\t\v]/g, ''),
        });
    }
    await browser.close();

    return csInfo;
}

async function getCookie(page) {
    await page.waitForSelector('input[type="email"]', { visible: true });

    await page.click('input[type="email"]');
    await page.type('input[type="email"]', `${process.env.USER_ID}@edu.teu.ac.jp`);
    try {
        await page.click('#identifierNext > div > button');
    } catch {
        await page.click('input#next');
    }

    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.click('input[type="password"]');
    await page.type('input[type="password"]', process.env.PASSWORD);
    try {
        await page.click('#passwordNext > div > button');
    } catch {
        await page.click('input#submit');
    }
    await page.waitForNavigation({ waitUntil: ['load', 'networkidle2'] });

    const isLogin = await page.evaluate(() => {
        // eslint-disable-next-line
        const node = document.querySelectorAll('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
        return node.length? false : true;
    });

    if (!isLogin) {
        await page.click('.input_f > tbody > tr:nth-child(2) > td > input');
        await page.type('.input_f > tbody > tr:nth-child(2) > td > input', process.env.USER_ID);
        await page.type('.input_f > tbody > tr:nth-child(3) > td > input', process.env.PASSWORD);
        await page.click('#content > form > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(4) > td > input[type=submit]');
    }

    const afterCookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(afterCookies));

    console.log('complete.');
}

(async () => {
    const start = performance.now();

    const infoData = await getInfomation();
    console.log(infoData);

    const end = performance.now();
    console.log(end - start);
})();
