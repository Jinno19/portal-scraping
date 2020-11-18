class Manager {
    static async login() {
        console.log('logged in');
    }
}

import Manager from './manager.js';

export class NewInfoManager extends Manager {
    static async get() {
        await this.login();
        console.log('New:', 'completed');
    }
}

export class LectureInfoManager extends Manager {
    static async get() {
        await this.login();
        console.log('Lec:', 'completed');
    }
}

NewInfoManager.get();
LectureInfoManager.get();

// login.js
export default async function login() {
    console.log('logged in');
}

import login from './login.js';

export default function getNewInfo() {
    await login();
    console.log('get処理');
}

// ! index.js
import NewInfoManager from './getNewInfo.js';
import LectureInfoManager from './lectureinfomanager.js';

setInterval(() => {
    NewInfoManager.get();
}, 60 * 60 * 1000);

setInterval(() => {
    LectureInfoManager.get();
}, 60 * 1000);
