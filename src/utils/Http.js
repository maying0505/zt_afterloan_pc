/**
 * Created by KKK on 2018/1/19
 * Desc net work
 */

import URI from 'urijs';
import {StorageKeys} from '../config';
import {SessionStorage} from './Storage';
import {message} from 'antd';

const NODE_ENV = ['development', 'production'];

const DevUrl = 'http://test.daihou.buyem.cn:92/';// 开发http请求地址
// const DevUrl = 'http://39.98.68.60:88';// 开发http请求地
//const DevUrl = 'http://192.168.1.147:8081';//hxj地址
//const ProUrl = 'http://39.98.68.60:8877';
const ProUrl = 'http://daihou.buyem.cn:92/'; 

let ENV = null;
let ROOT_URL = null;
let __DEV__ = false;

switch (process.env.NODE_ENV) {
    case 'development':
    case  'test':
        ROOT_URL = DevUrl;
        ENV = NODE_ENV[0];
        __DEV__ = true;
        break;
    case 'production':
        ROOT_URL = ProUrl;
        ENV = NODE_ENV[1];
        __DEV__ = false;
        break;
    default:
        ROOT_URL = ProUrl;
        ENV = NODE_ENV[1];
        __DEV__ = false;
        break;
}

class ResponseError extends Error {
    constructor(message, code, origin) {
        super(message);
        this.code = code;
        this.origin = origin;
    }
}

async function request(url, _options) {
    const uri = new URI(ROOT_URL + url);

    const options = _options || {};
    options.method = options.method || 'GET';
    options.headers = options.headers || {};
    options.mode = options.mode || 'cors';

    if (__DEV__) {
        console.log(`__DEV__ ${options.method} ${uri}`);
        if (options.body) {
            console.log('__DEV__', options.body);
        }
    }

    console.log('uri', uri);
    console.log('options', options);
    const resp = await fetch(uri.toString(), options);

    console.log('resp', resp);

    if (resp.status === 666) {
        const {origin} = window.location;
        const loginPage = `${origin}/#/`;
        console.log('loginPage', loginPage);
        window.location.href && (window.location.href = loginPage);
        message.error('请重新登录');
        return;
    }

    const text = await resp.text();
    const json = JSON.parse(text);


    if (__DEV__) {
        console.log('__DEV__ json', json);
    }

    // 如果请求失败
    if (resp.status !== 200) {
        if (__DEV__) {
            console.log('resp.status', resp.status);
            console.log('json.message', json.message);
            console.log('json', json);
        }
        throw new ResponseError('请求服务异常', resp.status, json);
    }

    return json;
}

const Http = {};

Http.get = async function (url, params = {}) {
    const token = SessionStorage.get(StorageKeys.token);
    let uri = url;
    let option = {};
    if (token) {
        option.headers = {
            token,
        };
    }
    if (Object.keys(params).length > 0) {
        uri = url + '?' + toQueryStr(params);
    }
    return request(uri, option);
};

Http.post = async function (url, params, options) {
    const token = SessionStorage.get(StorageKeys.token);
    if (url.includes('login')) {
        return request(url, {
            method: 'POST',
            // post非上传文件不加 Content-Type
            body: JSON.stringify({...params}),
            ...options,
        });
    } else if (token) {
        return request(url, {
            method: 'POST',
            // post非上传文件不加 Content-Type
            headers: {
                token,
            },
            body: JSON.stringify({...params}),
            ...options,
        });
    } else {
        message.error('请登陆后再试');
    }
};

Http.postForm = async function (url, params) {
    const token = SessionStorage.get(StorageKeys.token);
    if (url.includes('login')) {
        const body = new FormData();

        for (let key in params) {
            console.log('typeof', typeof params[key]);
            if (params[key]) {
                body.append(key, params[key]);
            }
        }

        return request(url, {
            method: 'POST',
            body
        });
    } else if (token) {

        const body = new FormData();

        for (let key in params) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                body.append(key, params[key]);
            }
        }

        const myHeaders = new Headers();
        myHeaders.append('token', token);

        return request(url, {
            method: 'POST',
            headers: myHeaders,
            body
        });
    }
    message.error('请登陆后再试');
};

Http.put = function (url, data, options) {
    return request(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
    });
};

Http.delete = function (url, data, options) {
    return request(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
    });
};

const toQueryStr = (obj) => {
    return obj ? Object.keys(obj).sort().map((key) => {
        const val = obj[key];
        if (Array.isArray(val)) {
            return val.sort().map((val2) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
            }).join('&');
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
};

export {Http, ROOT_URL};