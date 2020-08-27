const WebSocket = require('ws');
const util = require('util');

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({port});

const rpcMethods = {
    ping(param1) {
        console.info(`ping: ${param1}`);
        return Date.now();
    }
};

function error(ws, code, message) {
    ws.send(JSON.stringify({code, message}));
}

function success(ws, result, id) {
    ws.send(JSON.stringify({result, id}));
}

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const reqObj = JSON.parse(message);
        const id = reqObj['id'];
        const m = rpcMethods[reqObj['method']];
        if (typeof m !== 'function') {
            error(ws, 404, `not found method: ${reqObj['method']}`);
            return;
        }

        try {
            let result = null;
            if (!util.types.isAsyncFunction(m)) {
                result = m.apply(null, reqObj.params);
            } else {
                result = await m.apply(null, reqObj.params);
            }
            success(ws, result, id);
        } catch (e) {
            error(ws, 500, `${e.message}`);
        }
    });
});