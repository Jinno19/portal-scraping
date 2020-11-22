import util from 'util';

import puppeteer from 'puppeteer';

const REFERENCEINFORMATION_URL = 'https://kyo-web.teu.ac.jp/campusweb/';
const SYLLABUS_URL = 'https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=SYW0001000-flow';
const csReference = [];

async function getReference(page) {
    let title = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let titles = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(6)'), 
            a => a.textContent.replace(/[\n]/g, ''));
        return titles;
    });
    let instructor = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let instructors = Array.from(document.querySelectorAll('html > body > .normal > tbody > tr > td:nth-child(7)'), 
            a => a.textContent.replace(/[\n]/g, ''));
        return instructors;
    });
    const lectureLength = await page.evaluate(() => {
        //eslint-disable-next-line no-undef
        let lecLength = document.querySelector('body > b:nth-child(5)').textContent.replace( /[^0-9]/g, '');
        return parseInt(lecLength);
    });
    for (let i = 1; i <= lectureLength; i++) {
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
        csReference.push({
            title: title[i-1], 
            instructor: instructor[i-1], 
            Reference: refTitle,
        });
        await page.goBack();
    }
    return csReference;
}

//cron.schedule('0 */10 * * * ', () => {
(async () => {
    process.on('unhandledRejection', console.dir);

    const browser = await puppeteer.launch({
        args: [
            '--lang=ja',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--proxy-server=\'direct://\'',
            '--proxy-bypass-list=*',
        ] });
    const page = await browser.newPage();
    await page.goto(REFERENCEINFORMATION_URL);

    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]', process.env.USER_ID);
    await page.click('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]');
    await page.type('body > center > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input[type=password]', process.env.PASSWORD);
    await page.click('body > center > form > table > tbody > tr:nth-child(3) > td > table > tbody > tr > td > input[type=image]');

    await page.goto(SYLLABUS_URL);

    await page.waitForSelector('table #jikanwariShozokuCode');

    await page.click('table #jikanwariShozokuCode');
    await page.select('table #jikanwariShozokuCode', 'CS');

    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.select('table > tbody > tr:nth-child(11) > td > select', '500');
    await page.click('table > tbody > tr:nth-child(11) > td > select');
    await page.click('#jikanwariSearchForm > table > tbody > tr:nth-child(12) > td > p > input[type=button]');
    await page.waitFor(3000);
    const csResult = await getReference(page);
    //await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/reference', CS_result);
    console.log(util.inspect(csResult, { maxArrayLength: null }));
    
    await browser.close();
})();
//});
