export default class ServiceRequest {

    constructor (action, params = {}) {
        this.id = crypto.randomUUID()
        this.action = action
        this.params = params
        this.timestamp = Date.now()
    }


    export () {
        return {
            id: this.id,
            action: this.action,
            params: this.params,
            timestamp: this.timestamp
        }
    }


    static fromJSON (data) {
        const req = new ServiceRequest(data.action, data.params)
        req.id = data.id
        req.timestamp = data.timestamp
        return req
    }

}
