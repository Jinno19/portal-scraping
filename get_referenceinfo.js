import fs from "fs";
import puppeteer from "puppeteer";

const USER_ID = process.env.USER_ID;
const ACCOUNT_PASS = process.env.ACCOUNT_PASS;
const REFERENCEINFORMATION_URL = "https://kyo-web.teu.ac.jp/campusweb/";

const COOKIES_PATH = 'cookies.json';

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

    await page.waitForSelector('html > frameset > #idForChangeMenu > frame:nth-child(1)');
    const schedule_url = await page.evaluate(() => {
        const get_Selector = document.querySelector('html > frameset > #idForChangeMenu > frame:nth-child(1)');
        const get_schedule = get_Selector.getAttribute('src');
        return 'https://kyo-web.teu.ac.jp/campusweb/' + get_schedule;
    })
    const response = await page.goto(schedule_url);
    for(const req of response.request().redirectChain()) {
      console.log(`${req.url()} => ${req.response().headers().location}`);
    }

    await page.waitForSelector('tr:nth-child(10) > td > .menu-inner > tbody > tr > td > a > .menufunc');
    await page.click('tr:nth-child(10) > td > .menu-inner > tbody > tr > td > a > .menufunc');

    await page.waitFor(2000);
    let page_url = await page.url();
    console.log(page_url);

    const syllabus_url = await page.evaluate(() => {
        const get_SyllabusSelector = document.querySelector('html > body > #tabs > #tabs-1 > #jikanwariSearchForm > input[type=hidden]:nth-child(2)');
        const get_Syllabus = get_SyllabusSelector.getAttribute('value');
        return 'https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowExecutionKey=' + get_Syllabus;
    })

    await page.goto(syllabus_url);
    await page.waitForSelector('table #jikanwariShozokuCode');
    await page.click('table #jikanwariShozokuCode');
    await page.select('table #jikanwariShozokuCode', 'CS');
  
    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.select('table > tbody > tr:nth-child(11) > td > select', '500');

    await page.click('table > tbody > tr:nth-child(11) > td > select');
    //await browser.close();
})();
