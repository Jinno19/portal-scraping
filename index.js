import cron from 'node-cron';

import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { goToSyllabus } from './getReferenceInfo.js';

cron.schedule('0 * * * *', () => {
    getNewAndLectureInfo();
});

cron.schedule('0 0 */10 * *', () => {
    getReferenceInfo();
});

async function getNewAndLectureInfo() {
    await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
}

async function getReferenceInfo() {
    await goToSyllabus();
}
