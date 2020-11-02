import puppeteer from "puppeteer";
import fs from "fs";

const INFORMATION_URL = "https://service.cloud.teu.ac.jp/portal/inside";

const COOKIES_PATH = 'cookies.json';

async function getData(page, url) {
    await page.goto(url);
    let get_object = await page.evaluate(() => {
        let data = document.querySelectorAll('.post > .entry-body > p');
        const Stlist = [];
        for (let i = 0; i < data.length; i++) {
            Stlist.push(data[i].textContent);
        }
        return Stlist;
    })
    return get_object;
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

    await page.goto(INFORMATION_URL, {waitUntil: 'domcontentloaded'});

    await page.waitFor(2000);
    let frames = await page.frames();
    const frame_567 = frames.find(f => f.url() === 'https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
    await frame_567.waitForSelector('#post-169 > .entry-body > .nav > li:nth-child(2) > a');
    await frame_567.click('#post-169 > .entry-body > .nav > li:nth-child(2) > a');

    await frame_567.waitFor(3000);

    const articleList = await frame_567.evaluate(() => {
        let l = [];
        let tmpList = document.querySelectorAll('#tab2 > .front_news_list > li > a, #tab2 > .front_news_list > li > p > a:nth-child(2)');
        tmpList.forEach(e => {
            if (!e.textContent.trim()) {
                return;
            }
            l.push({
                title: e.textContent.trim(),
                uri: e.href,
                is_pdf: /\.pdf$/.test(e.href),
            });
        });

        return l;
    });


    const hrefs = await frame_567.evaluate(() =>
        Array.from(document.querySelectorAll('#tab2 > .front_news_list > li > a'),
            a => a.getAttribute('href')
        )
    );

    const url = hrefs.map(href => {
        return 'https://service.cloud.teu.ac.jp' + href;
    });
    
 
    const sentence = [];

    for (let i = 0; i < hrefs.length; i++) {
        let result = await getData(page, url[i]);
        sentence.push(result);
    }

    for (let s = 0; s < sentence.length; s++) {
        console.log('title: ' + articleList[s].title);
        console.log('uri: ' + articleList[s].uri);
        console.log('sentence: ' + sentence[s]);
        console.log('is_pdf: ' + articleList[s].is_pdf);
        console.log('\n');
    }
    browser.close();
})();
