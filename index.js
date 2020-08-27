const WebSocket = require('ws');

module.exports = class RpcClient {
    constructor() {
        this.ws = null;
        this.requestId = 0;
        this.callbacks = {};
    }

    open(wsHost) {
        const thiz = this;
        thiz.ws = new WebSocket(wsHost, {});
        thiz.ws.on('close', function close() {
            console.error('disconnected');
        });
        thiz.ws.on('message', (message) => {
            try {
                const jsonRpcLikeResponseObj = JSON.parse(message);
                const id = jsonRpcLikeResponseObj['id'];
                if (typeof id !== 'undefined') {
                    let callback = thiz.callbacks[id];
                    if (callback && typeof callback === 'function') {
                        delete thiz.callbacks[id];
                        callback(jsonRpcLikeResponseObj);
                    }
                } else {
                    console.error("some message not handle:", message);
                }
            } catch (error) {
                console.error("onmessage have some error:", error.message, " data:", message);
            }
        });
        return new Promise((resolve, reject) => {
            thiz.ws.on('open', function open() {
                resolve();
            });
        });
    }

    sendCommand(method, params) {
        const reqId = ++this.requestId;
        const req = {
            id: reqId,
            method,
            params
        };
        const message = JSON.stringify(req);
        const thiz = this;
        return new Promise((resolve, reject) => {
            thiz.callbacks[reqId] = (resObj) => {
                if (resObj['error']) {
                    reject(resObj['error'])
                } else {
                    resolve(resObj['result']);
                }
            };
            thiz.ws.send(message);
        });
    }

    async ping(time) {
        return await this.sendCommand('ping', [time || Date.now()]);
    }
};
