function parseRawIdFirefox (rawId) {
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


function parseRawIdChrome (rawId) {
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


function getTypeFromVendor (vendor) {
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


function getTypeFromName (name) {
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


function getPlaystationModel (name) {
    const nameLC = name?.toLowerCase() || ''

    const modelMap = [
        {check: s => s.includes('dualshock 4') || s.includes('ds4'), model: 'ds4'},
        {check: s => s.includes('dualshock 3') || s.includes('ds3'), model: 'ds3'},
        {check: s => s.includes('dualsense'), model: 'dualsense'}
    ]
  
    return modelMap.find(m => m.check(nameLC))?.model || 'unknown'
}


function refineControllerType (result) {
    if (result.type === 'playstation') {
        if (result.model === 'ds4') {
            result.type = 'ps4'
        } else if (result.model === 'dualsense') {
            result.type = 'ps5'
        } else if (result.model === 'ds3') {
            result.type = 'ps3'
        }
    } else if (result.type === 'nintendo') {
        result.type = 'switch'
    }
  
    return result
}


function parseRawId (rawId) {
    return parseRawIdFirefox(rawId) || parseRawIdChrome(rawId) || {name: rawId}
}


export function parseGamepadId (rawId) {

    if (!rawId || typeof rawId !== 'string') {
        return {
            raw: rawId,
            vendor: null,
            product: null,
            name: null,
            type: 'unknown'
        }
    }

    const result = {
        raw: rawId,
        vendor: null,
        product: null,
        name: null,
        type: 'generic'
    }

    const parsedResult = parseRawId(rawId)
    if (parsedResult) {
        Object.assign(result, parsedResult)
    }

    if (result.vendor) {
        result.type = getTypeFromVendor(result.vendor)
    } else {
        result.type = getTypeFromName(rawId)
    }

    if (result.type === 'playstation') {
        result.model = getPlaystationModel(result.name)
    }

    return refineControllerType(result)
}
