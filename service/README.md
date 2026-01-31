# Service

RPC over message passing. A host registers actions, a client calls them. Works across Web Workers, MessageChannels, or in-memory — same API regardless of transport.

---

## How it fits together

```
ServiceClient ──── request('action', params) ────►  ServiceHost
     │                                                    │
     │          ◄── response (data or error) ────         │
     │                                                    │
     ├── emitToHost() ──── event ────►  client:eventName  │
     │                                                    │
     │   host:eventName  ◄──── event ── emitToClient() ──┤
     │                                                    │
     └── ServiceTransport              ServiceTransport ──┘
              │                              │
              └──── Worker / Channel / pair / local ───┘
```

The client sends requests, the host routes them to registered handlers and replies. Both sides can also fire events to each other. The transport layer is swappable — same code runs in a Worker thread or in the same context.

---

## The files that matter

### [service_client.js](service_client.js)

Sends requests and receives responses. Promise-based with configurable timeout.

```js
const client = ServiceClient.from({worker: './my_service.js'})

const result = await client.request('greet', {name: 'Perky'})

// Events
client.on('host:updated', (data) => { /* host pushed an update */ })
client.emitToHost('ping')
```

Multiple ways to create a client:

```js
// From a Worker (runs service in a separate thread)
ServiceClient.from({worker: './my_service.js'})

// From a class (in-memory, no Worker)
ServiceClient.from({service: MyService})

// From a module path (dynamic import)
ServiceClient.from({path: './my_service.js'})
```

---

### [service_host.js](service_host.js)

Receives requests and dispatches them to registered handlers. Express-style `(req, res)` API.

```js
class MyService extends ServiceHost {
    static serviceMethods = ['greet']

    greet (req, res) {
        res.send(`Hello ${req.params.name}`)
    }
}
```

Or register handlers manually:

```js
const host = new ServiceHost()

host.register('greet', (req, res) => {
    res.send(`Hello ${req.params.name}`)
})

host.register('fail', (req, res) => {
    res.error('Something went wrong')
})
```

Events from the client arrive as `client:eventName`:

```js
host.on('client:ping', () => host.emitToClient('pong'))
```

---

### [service_transport.js](service_transport.js)

The messaging layer. Abstracts away how messages travel between client and host.

```js
// Auto-detect (Worker context → postMessage, otherwise local)
ServiceTransport.auto()
ServiceTransport.auto(worker)

// Explicit
ServiceTransport.worker(worker)     // talk to a Worker
ServiceTransport.main()             // talk from inside a Worker
ServiceTransport.channel(port)      // MessageChannel port
ServiceTransport.local()            // in-memory, same context
ServiceTransport.pair()             // two linked transports
```

`pair()` is useful for testing or in-memory services — it returns two transports wired together.

---

### [service_request.js](service_request.js) + [service_response.js](service_response.js)

Data classes for the protocol. You don't create these directly — the client builds requests, the host builds responses.

A request has an `id`, `action`, `params`, and `timestamp`. A response has a `requestId`, `success` flag, `data`, and `error`.

---

### [service_worker.js](service_worker.js)

Web Worker bootstrap. Receives an `init-service` message, dynamically imports the service class, and instantiates it. Used internally by `ServiceClient.fromWorker()`.

---

## Going further

Each file has its `.test.js` with tests. Start with `service_client.js` and `service_host.js` to understand the full request/response flow.
