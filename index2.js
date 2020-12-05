import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { puppeteerLauncher } from './get_CSreferenceinfo.js';


(async () => {
    console.log('a');
    await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
    console.log('c');
    await puppeteerLauncher();
})();

(async () => {
    console.log('b');
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
})();
