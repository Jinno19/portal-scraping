//看護学科参考書情報取得

import puppeteer from 'puppeteer';
import axios from 'axios';

const REFERENCEINFORMATION_URL = 'https://kyo-web.teu.ac.jp/campusweb/';
const SYLLABUS_URL = 'https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=SYW0001000-flow';
let csReference = '';
let startNumber = 0;

async function loginProcesser(page) {
    await page.waitForSelector('body > center > form > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > input[type=image]');
    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]', process.env.USER_ID);
    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]', process.env.PASSWORD);
    await page.click('body > center > form > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > input[type=image]');

    await page.waitFor(1000);

    const content = await page.$eval('html', html => {
        return html.innerHTML;
    });
    if (/タイムアウト/.test(content)) {
        loginProcesser(page);
    } else {
        return '';
    }
}

async function getReference(page) {
    await page.waitFor(15000);
    let titles = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let titles = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(6)'), 
            a => a.textContent.replace(/[\n]/g, ''));
        return titles;
    });
    console.log(titles);
    let instructors = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let instructors = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(7)'), 
            a => a.textContent.replace(/[\n]/g, ''));
        return instructors;
    });
    console.log(instructors);
    const lectureLength = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let lecLength = document.querySelector('body > b:nth-child(5)').textContent.replace( /[^0-9]/g, '');
        return parseInt(lecLength);
    });
    await contextGeter(titles, instructors, lectureLength, page, startNumber);

    return csReference;
}

async function contextGeter(title, instructor, lectureLength, page, number) {
    try {
        for (let i = number+1; i <= lectureLength; i++) {
            await page.waitForSelector(`body > .normal > tbody > tr:nth-child(${lectureLength}) > td:nth-child(8) > input`);
            await page.click(`body > .normal > tbody > tr:nth-child(${i}) > td:nth-child(8) > input`);
            await page.waitForSelector('#tabs > ul > li:nth-child(2) > a');
            await page.click('#tabs > ul > li:nth-child(2) > a');
            await page.waitForSelector('#tabs-2 > table > tbody > tr:nth-child(9) > th');
            let refTitle = await page.evaluate(() => {
                //eslint-disable-next-line no-undef
                let isReference = document.querySelector('#tabs-2 > table > tbody > tr:nth-child(9) > th').textContent.replace(/[\n]/g, '').trim();
                if (isReference === '参考書') {
                    //eslint-disable-next-line no-undef
                    let rTitle = document.querySelector('#tabs-2 > table > tbody > tr:nth-child(9) > .syllabus-break-word');
                    return rTitle.textContent.replace(/[\n]/g, '').trim();
                } else {
                    return '参考書の指定はありません。';
                }
            });

            const lecTitle = title[i-1].toString().replace(/[\f\r\t\v]/g, '');
            const lecInstructor = instructor[i-1].toString().replace(/[\f\r\t\v]/g, '');

            csReference = refTitle.toString().replace(/[\f\r\t\v]/g, '');
            startNumber++;

            await postAxios(lecTitle, lecInstructor); 

            let number = i;
            console.log(number);

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'load' }),
                await page.goBack(),
            ]);
        }

    } catch (err) {
        console.error(err + '\ncontinue.');
        const pointer = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const node = document.querySelectorAll('body > .normal > tbody > tr:nth-child(1) > td:nth-child(8) > input');
            return !node.length;
        });
        if (!pointer) {
            console.log('input form appear!');
            await contextGeter(title, instructor, lectureLength, page, startNumber);
        } else {
            console.log('input form disappear…');
            await page.goBack();
            await contextGeter(title, instructor, lectureLength, page, startNumber);
        }
    }
}

async function postAxios(title, instructor) {
    try {
        // eslint-disable-next-line no-unused-vars
        let res = await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/reference', 
            [
                {
                    // eslint-disable-next-line
                    "title": title,
                    // eslint-disable-next-line 
                    "instructor": instructor, 
                    // eslint-disable-next-line
                    "Reference": csReference
                // eslint-disable-next-line
                }
            ]);
        
        console.log(title);
        console.log(instructor);
        console.log(csReference);
        
    } catch (err) {
        console.error(err + '\ncontinue');
        if (/429/.test(err)) {
            await postAxios(title, instructor);
        }
    }
}

//cron.schedule('0 */10 * * * ', () => {
export async function puppeteerLauncher() {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        args: [
            '--window-size=1280,720',
            '--lang=ja',
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
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });
    page.setDefaultTimeout(0);
    await page.goto(REFERENCEINFORMATION_URL);

    await loginProcesser(page);

    await page.goto(SYLLABUS_URL);

    await page.waitForSelector('table > tbody > tr:nth-child(2) > td:nth-child(2) > #jikanwariShozokuCode');

    await page.click('table > tbody > tr:nth-child(2) > td:nth-child(2) > #jikanwariShozokuCode');
    await page.select('table > tbody > tr:nth-child(2) > td:nth-child(2) > #jikanwariShozokuCode', 'HSH1');

    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.select('table > tbody > tr:nth-child(11) > td > select', '500');
    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.click('#jikanwariSearchForm > table > tbody > tr:nth-child(12) > td > p > input[type=button]');

    await getReference(page);

    await browser.close();
}
//});

puppeteerLauncher();
