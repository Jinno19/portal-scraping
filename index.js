import cron from 'node-cron';

import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { puppeteerLauncher } from './get_CSreferenceinfo.js';

//cron.schedule('0 10 * * * * ', () => {
const newInfo = getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
//});

//cron.schedule('0 15 * * * * ', () => {
const letureInfo = getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
//});

//cron.schedule('0 30 * * * * ', () => {
const referenceInfo = puppeteerLauncher();
//});

/*
const funcs = [
    getNewInformations,
    getLecturePage,
    puppeteerLauncher,
];
*/

