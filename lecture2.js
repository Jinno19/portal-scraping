import axios from 'axios';

async function main() {
    try {
        const response = await axios.get('https://yt.bea/');
        console.log(response.data?.slice(0, 100));
    } catch {}
}

main();
