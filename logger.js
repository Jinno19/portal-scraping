// @ts-check
import log4js from 'log4js';

export default log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {type: 'pattern', pattern: '%d{ISO8601} %5p %c - %m'}
        },
    },
    categories: {
        default: {
            appenders: ['out'], level: 'all',
        },
    },
}).getLogger('main');
