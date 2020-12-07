import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { puppeteerLauncher } from './get_CSreferenceinfo.js';


(async () => {
    await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
    await puppeteerLauncher();
})();


