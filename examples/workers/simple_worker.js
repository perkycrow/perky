// Simple worker de test
console.log('Worker started!')

self.onmessage = function(event) {
    const { action, data } = event.data
    
    console.log('Worker received:', action, data)
    
    switch (action) {
        case 'add':
            const result = data.a + data.b
            self.postMessage({ 
                success: true, 
                result,
                message: `${data.a} + ${data.b} = ${result}`
            })
            break
            
        case 'greet':
            self.postMessage({ 
                success: true, 
                result: `Hello ${data.name}!`,
                message: 'Greeting sent'
            })
            break
            
        default:
            self.postMessage({ 
                success: false, 
                error: `Unknown action: ${action}`
            })
    }
}

self.postMessage({ success: true, message: 'Worker ready!' })
