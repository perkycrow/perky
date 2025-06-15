
export default class GamepadInfo {

    constructor (rawId) {
        this.raw = rawId
        this.vendor = null
        this.product = null
        this.name = null
        this.type = 'generic'
        this.model = null

        if (!rawId || typeof rawId !== 'string') {
            this.type = 'unknown'
            return
        }

        this.#parseRawId()
        this.#determineType()
        this.#refineType()
    }


    #parseRawId () {
        const parsedResult = GamepadInfo.#parseRawIdFirefox(this.raw) || 
                           GamepadInfo.#parseRawIdChrome(this.raw) || 
                           {name: this.raw}
        
        if (parsedResult) {
            Object.assign(this, parsedResult)
        }
    }


    #determineType () {
        if (this.vendor) {
            this.type = GamepadInfo.#getTypeFromVendor(this.vendor)
        } else {
            this.type = GamepadInfo.#getTypeFromName(this.raw)
        }
    }


    #refineType () {
        if (this.type === 'playstation') {
            this.model = GamepadInfo.#getPlaystationModel(this.name)
            if (this.model === 'ds4') {
                this.type = 'ps4'
            } else if (this.model === 'dualsense') {
                this.type = 'ps5'
            } else if (this.model === 'ds3') {
                this.type = 'ps3'
            }
        } else if (this.type === 'nintendo') {
            this.type = 'switch'
        }
    }


    static #parseRawIdFirefox (rawId) {
        const firefoxPattern = /^([0-9a-f]{1,4})-([0-9a-f]{1,4})-(.+)$/i
        const match = rawId.match(firefoxPattern)
      
        if (match) {
            return {
                vendor: match[1],
                product: match[2],
                name: match[3]
            }
        }
        return null
    }


    static #parseRawIdChrome (rawId) {
        const chromePattern = /^(.+) \(.*[Vv]endor: ?([0-9a-f]{1,4}).*[Pp]roduct: ?([0-9a-f]{1,4}).*\)$/i
        const match = rawId.match(chromePattern)
      
        if (match) {
            return {
                name: match[1],
                vendor: match[2],
                product: match[3]
            }
        }
        return null
    }


    static #getTypeFromVendor (vendor) {
        const vendorMap = {
            '054c': 'playstation',
            '045e': 'xbox',
            '057e': 'nintendo',
            '046d': 'logitech',
            '0079': 'nintendo',
            '0810': 'generic',
            '0e8f': 'generic',
            '2dc8': '8bitdo'
        }
      
        return vendorMap[vendor.toLowerCase()] || 'generic'
    }


    static #getTypeFromName (name) {
        const nameLC = name.toLowerCase()
        const patterns = [
            {regex: /^gamepad \d+$/i, type: 'xbox'},
            {regex: /playstation|dualshock|dualsense|ps[1-5]/i, type: 'playstation'},
            {regex: /xbox|microsoft/i, type: 'xbox'},
            {regex: /nintendo|switch|joycon|pro controller|nes|snes|n64/i, type: 'nintendo'},
            {regex: /logitech/i, type: 'logitech'},
            {regex: /8bitdo/i, type: '8bitdo'}
        ]
      
        return patterns.find(p => p.regex.test(nameLC))?.type || 'generic'
    }


    static #getPlaystationModel (name) {
        const nameLC = name?.toLowerCase() || ''

        const modelMap = [
            {check: s => s.includes('dualshock 4') || s.includes('ds4'), model: 'ds4'},
            {check: s => s.includes('dualshock 3') || s.includes('ds3'), model: 'ds3'},
            {check: s => s.includes('dualsense'), model: 'dualsense'}
        ]
      
        return modelMap.find(m => m.check(nameLC))?.model || 'unknown'
    }

}
