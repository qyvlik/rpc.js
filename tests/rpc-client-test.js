const RpcClient = require('../index');

const rpc = new RpcClient();

(async () => {
    await rpc.open('ws://localhost:8080');
    console.info(await rpc.ping(Date.now()));
    console.info(await rpc.ping(1));
    console.info(await rpc.ping(2));
})();
