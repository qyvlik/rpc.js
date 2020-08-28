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
            let resObj = null;
            try {
                resObj = JSON.parse(message);
            } catch (error) {
                console.error(`onmessage parse error: message:${message}, ${error.message}`);
                return;
            }
            const callback = thiz.callbacks[resObj['id']];
            try {
                callback(resObj);
            } catch (error) {
                console.error(`onmessage have some error: ${error.message}, message:${message}`);
            } finally {
                delete thiz.callbacks[resObj['id']];
            }
        });
        return new Promise((resolve, reject) => {
            thiz.ws.on('open', function open() {
                resolve();
            });
        });
    }

    sendCommand(method, params) {
        const id = ++this.requestId;
        const reqMsg = JSON.stringify({id, method, params});
        const thiz = this;
        return new Promise((resolve, reject) => {
            thiz.callbacks[id] = (resObj) => {
                if (resObj['error']) {
                    reject(resObj['error'])
                } else {
                    resolve(resObj['result']);
                }
            };
            thiz.ws.send(reqMsg);
        });
    }

    async ping(time) {
        return await this.sendCommand('ping', [time || Date.now()]);
    }
};
