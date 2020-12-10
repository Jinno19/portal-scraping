import cron from 'node-cron';

import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { goToBtSyllabus } from './get_BTreferenceinfo.js';
import { goToCsSyllabus } from './get_CSreferenceinfo.js';
import { goToDsSyllabus } from './get_DSreferenceinfo.js';
import { goToEsE5Syllabus } from './get_ESE5referenceinfo.js';
import { goToEsE6Syllabus } from './get_ESE6referenceinfo.js';
import { goToEsE7Syllabus } from './get_ESE7referenceinfo.js';
import { goToEsSyllabus } from './get_ESreferenceinfo.js';
import { goToGfSyllabus } from './get_GFreferenceinfo.js';
import { goToHsH1Syllabus } from './get_HSH1referenceinfo.js';
import { goToHsH2Syllabus } from './get_HSH2referenceinfo.js';
import { goToHsH3Syllabus } from './get_HSH3referenceinfo.js';
import { goToHsH4Syllabus } from './get_HSH4referenceinfo.js';
import { goToHsH5Syllabus } from './get_HSH5referenceinfo.js';
import { goToHsSyllabus } from './get_HSreferenceinfo.js';
import { goToMsSyllabus1 } from './get_MSProphasereferenceinfo.js';
import { goToMsSyllabus2 } from './get_MSLatereferenceinfo.js';
import { goToX1Syllabus } from './get_X1referenceinfo.js';
import { goToX3Syllabus } from './get_X3referenceinfo.js';

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
    await goToBtSyllabus();
    await goToCsSyllabus();
    await goToDsSyllabus();
    await goToEsE5Syllabus();
    await goToEsE6Syllabus();
    await goToEsE7Syllabus();
    await goToEsSyllabus();
    await goToGfSyllabus();
    await goToHsH1Syllabus();
    await goToHsH2Syllabus();
    await goToHsH3Syllabus();
    await goToHsH4Syllabus();
    await goToHsH5Syllabus();
    await goToHsSyllabus();
    await goToMsSyllabus1();
    await goToMsSyllabus2();
    await goToX1Syllabus();
    await goToX3Syllabus();
}
