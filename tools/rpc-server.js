const WebSocket = require('ws');

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

wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
        const reqObj = JSON.parse(message);
        const id = reqObj['id'];
        const m = rpcMethods[reqObj['method']];
        if (typeof m !== 'function') {
            error(ws, 404, `not found method: ${reqObj['method']}`);
            return;
        }
        try {
            const result = m.apply(null, reqObj.params);
            success(ws, result, id);
        } catch (error) {
            error(ws, 500, `${error.message}`);
        }
    });
});