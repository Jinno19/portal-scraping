import axios from 'axios';
import cheerio from 'cheerio';
//import logger from './logger.js';
import cron from 'node-cron';

import { login, getCookie } from './login.js';

async function getNewInformations(uri) {
    await login();
    const cookie = getCookie();

    const informations = [];

    const response = await axios.get(uri, {
        withCredentials: true,
        headers: {Cookie: cookie},
    });

    const $ = cheerio.load(response.data);

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
        const page = await axios.get(information.uri, {
            withCredentials: true,
            headers: {Cookie: cookie},
        });
        const $ = cheerio.load(page.data);
        information.context = $('.post > .entry-body').text().replace(/[\f\r\n\t\v]/g, '');
    }
    return  informations;
}

//cron.schedule('0 */10 * * * ', () => {
    (async () => {
        const result_data = await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
        //await axios.post('https://tut-php-api.herokuapp.com/api/v1/infos/new', result_data);
        console.log(result_data);
    })();
//});