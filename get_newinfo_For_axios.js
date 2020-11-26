import fs from 'fs';
import { performance } from 'perf_hooks';

import axios from 'axios';
import cheerio from 'cheerio';
import logger from './logger.js';

import { login } from './cookiesLogin.js';

const COOKIE_PATH = 'cookies.json';

async function getPage(uri) {

    const informations = [];

    const json = fs.readFileSync(COOKIE_PATH, 'utf-8');
    const value = JSON.parse(json).find(obj => obj.name === 'auth_tkt').value;
    const cookie = `auth_tkt=${value};`;

    let result = (await axios.get(uri, {
        withCredentials: true,
        headers: {
            Cookie: cookie,
        }, 
    }).catch(console.error));
    if (/Google アカウントでログイン/.test(result.data)) {
        await login();
        result = getPage(uri);
        return result;
    }
    const $ = cheerio.load(result.data);
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
        result = await axios.get(information.uri, {
            withCredentials: true,
            headers: {
                Cookie: cookie,
            }, 
        }).catch(console.error);
        const $ = cheerio.load(result.data);
        information.context = $('.post > .entry-body').text().replace(/[\f\r\n\t\v]/g, '');
    }
    return informations;
}

(async () => {
    const uri = 'https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/';
    const resultData = await getPage(uri);
    logger.info(resultData);
    const end = performance.now();
    console.log(end - start);
})();

const start = performance.now();
logger.info('start');
