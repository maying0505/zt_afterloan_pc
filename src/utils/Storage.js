const SALT = '__storage__prefix__';

const LocalStorage = {
    get(key) {
        const strValue = localStorage.getItem(SALT + key);
        return JSON.parse(strValue);
    },
    set(key, jsonValue) {
        const strValue = JSON.stringify(jsonValue);
        localStorage.setItem(SALT + key, strValue);
    },
    remove(key) {
        localStorage.removeItem(SALT + key);
    },
    removeAll() {
        localStorage.clear();
    }
};

const SessionStorage = {
    get(key) {
        const strValue = sessionStorage.getItem(SALT + key);
        return JSON.parse(strValue);
    },
    set(key, jsonValue) {
        const strValue = JSON.stringify(jsonValue);
        sessionStorage.setItem(SALT + key, strValue);
    },
    remove(key) {
        sessionStorage.removeItem(SALT + key);
    },
    removeAll() {
        sessionStorage.clear();
    }
};

export {
    LocalStorage,
    SessionStorage,
}