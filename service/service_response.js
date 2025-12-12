export default class ServiceResponse {

    constructor (requestId) {
        this.requestId = requestId
        this.success = true
        this.data = null
        this.error = null
    }


    send (data) {
        this.success = true
        this.data = data
        return this
    }


    fail (error) {
        this.success = false
        this.error = error
        return this
    }


    export () {
        return {
            requestId: this.requestId,
            success: this.success,
            data: this.data,
            error: this.error
        }
    }

}
