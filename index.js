import { getNewInformations } from './getNewInfo.js';
import { getLecturePage } from './getLectureInfo.js';
import { puppeteerLauncher } from './get_CSreferenceinfo.js';

(async () => {
    await getNewInformations('https://service.cloud.teu.ac.jp/inside2/hachiouji/computer_science/');
})();

(async () => {
    await getLecturePage('https://service.cloud.teu.ac.jp/inside2/hachiouji/hachioji_common/cancel/');
})();

(async () => {
    await puppeteerLauncher('https://kyo-web.teu.ac.jp/campusweb/');
})();
