# rpc.js

## tests

1. start up rpc ws server: `node tools/rpc-server.js`
2. run the test case: `node tests/rpc-client-test.js`

```js
const RpcClient = require('../index');

const rpc = new RpcClient();

(async () => {
    await rpc.open('ws://localhost:8080');
    console.info(await rpc.ping(Date.now()));
    console.info(await rpc.ping(1));
    console.info(await rpc.ping(2));
})();
```
