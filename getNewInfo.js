//import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
//import logger from './logger.js';
//import cron from 'node-cron';
import axios from 'axios';

import { main } from './login.js';
import { app } from './main.js';


async function getNewInformations(uri) {
    await main();

    const informations = [];

    const app2 = await app;
    const page = (await app2.pages())[0];
    await page.goto(uri);
    let html = await page.$eval('html', html  => {
        return html.innerHTML;
    });
    const $ = cheerio.load(html);

    $('#tab2 > .front_news_list > li').each((_i, elem) => {
        informations.push({
            date: $(elem).find('datetime').text().replace(/[\f\r\t\v]/g, ''),
            title: $(elem).find('p > a:nth-child(2), a > p').text().replace(/[\f\r\t\v]/g, ''),
            uri: `https://service.cloud.teu.ac.jp${$(elem).find('p > a:nth-child(2), a').attr('href')}`,
            context: '',
            tags: $(elem).find('span.cat').toArray().map(elem => $(elem).text()),
        });
    });   

    $('#tab1 > .front_news_list > li').each((_i, elem) => {
        const datetime = $(elem).find('datetime').text().trim();
        const title = $(elem).find('p > a:nth-child(2), a > p').text().replace(/[\f\r\t\v]/g, '');
        informations.map(information => {
            if (information.date === datetime && information.title === title) {
                information.tags.push('重要');
                information.tags = [...new Set(information.tags)];
            }
            return  information;
        });
    });

    for (const information of informations) {
        await page.goto(information.uri);
        html = await page.$eval('html', html  => {
            return html.innerHTML;
        });
        const $ = cheerio.load(html);
        information.context = $('.post > .entry-body').text().replace(/[\f\r\n\t\v]/g, '');
    }

    await app2.close();
    await postAxios(informations);
    return  informations;
}

async function postAxios(informations) {
    try {
        // eslint-disable-next-line no-unused-vars
        //let res = await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/new', informations);
        console.log(informations);
    } catch (err) {
        console.error(err + '\ncontinue');
        if (/429/.test(err)) {
            await postAxios(informations);
        }
    }
}

//cron.schedule('0 */10 * * * ', () => {
(async () => {
    await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
})();
//});
