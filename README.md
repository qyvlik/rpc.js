# rpc.js

## example

```js

const RpcClient = require('rpc.js');

const rpc = new RpcClient();

(async()=>{
    await rpc.open('ws://localhost:4000');
    await rpc.ping();
    await rpc.ping();
    await rpc.ping();
});
```
