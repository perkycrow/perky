import WorkerHost from '/core/worker_host.js'

// Créer le host
const host = new WorkerHost()

// Définir les actions disponibles
host.on('add', ({ a, b }) => {
    const result = a + b
    host.send('result', {
        operation: 'add',
        input: { a, b },
        output: result,
        message: `${a} + ${b} = ${result}`
    })
})

host.on('greet', ({ name }) => {
    const message = `Hello ${name}!`
    host.send('greeting', {
        name,
        message
    })
})

host.on('ping', () => {
    host.send('pong', {
        timestamp: Date.now(),
        message: 'Worker is alive!'
    })
})

// Confirmer que le worker est prêt
host.send('ready', {
    message: 'Clean worker is ready and listening!',
    actions: ['add', 'greet', 'ping']
})
