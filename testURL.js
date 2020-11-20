import axios from 'axios';
import puppeteer from 'puppeteer';

const COOKIE_PATH = 'cookies.json';

export async function login() {
    process.on('unhandledRejection', console.dir);

    try {
        const Cookie = getCookie();
        await axios.get('https://service.cloud.teu.ac.jp/portal/index', {headers: {Cookie}});
        const Page_uri = location.href;
        console.log(Page_uri);
        if (!/Google.com/.test(Page_uri)) {
            return;
        }
    } catch {}

    const browser = await puppeteer.launch({
        args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--proxy-server=\'direct://\'',
        '--proxy-bypass-list=*',
    ]});

    const page = await browser.newPage();
    await page.goto('https://service.cloud.teu.ac.jp/portal/inside', {waitUntil: 'networkidle0'});
    await page.setUserAgent('bot');

    let html = await page.url();
    console.log(html);
    /*
    let html2 = await page.$eval('html', item => {
        return item.innerHTML;
    })
    console.log(html2);
    */
    await page.screenshot({path: 'test.png'});
    
    await browser.close();
}

export function getCookie() {
    try {
        return [JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf-8'))
        .find(obj => obj.name === 'auth_tkt')]
        .map(obj => `${obj.name}=${obj.value};`)[0];
    } catch {
        return '';
    }
}

(async () => {
    await login();
})();