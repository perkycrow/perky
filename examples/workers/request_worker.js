import WorkerHost from '/core/worker_host.js'

const host = new WorkerHost()

host.on('add', ({a, b}, requestId) => {
    const result = a + b
    if (requestId) {
        host.reply('result', {
            operation: 'add',
            input: {a, b},
            output: result,
            message: `${a} + ${b} = ${result}`
        }, requestId)
    } else {
        host.send('result', {
            operation: 'add',
            input: {a, b},
            output: result,
            message: `${a} + ${b} = ${result}`
        })
    }
})

host.on('greet', ({name}, requestId) => {
    const message = `Hello ${name}!`
    if (requestId) {
        host.reply('greeting', {name, message}, requestId)
    } else {
        host.send('greeting', {name, message})
    }
})

host.on('ping', (data, requestId) => {
    const response = {
        timestamp: Date.now(),
        message: 'Worker is alive!'
    }
    if (requestId) {
        host.reply('pong', response, requestId)
    } else {
        host.send('pong', response)
    }
})

host.on('slowTask', ({delay = 3000}, requestId) => {
    setTimeout(() => {
        const response = {
            message: `Task completed after ${delay}ms`,
            timestamp: Date.now()
        }
        if (requestId) {
            host.reply('taskComplete', response, requestId)
        } else {
            host.send('taskComplete', response)
        }
    }, delay)
})

host.send('ready', {
    message: 'Request worker is ready!',
    actions: ['add', 'greet', 'ping', 'slowTask']
})
