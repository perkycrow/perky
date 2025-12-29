const Easing = {

    linear: t => t,

    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - (--t) * t * t * t,
    easeInOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + (--t) * t * t * t * t,
    easeInOutQuint: t => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t),

    easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: t => Math.sin(t * Math.PI / 2),
    easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

    easeInExpo: t => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
    easeOutExpo: t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    easeInOutExpo: t => {
        if (t === 0) {
            return 0
        }
        if (t === 1) {
            return 1
        }
        if (t < 0.5) {
            return Math.pow(2, 20 * t - 10) / 2
        }
        return (2 - Math.pow(2, -20 * t + 10)) / 2
    },

    easeInCirc: t => 1 - Math.sqrt(1 - t * t),
    easeOutCirc: t => Math.sqrt(1 - (--t) * t),
    easeInOutCirc: t => (t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2),

    easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
    easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    easeInOutBack: t => {
        const c = 1.70158 * 1.525
        return t < 0.5
            ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
            : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
    },

    easeInElastic: t => {
        if (t === 0) {
            return 0
        }
        if (t === 1) {
            return 1
        }
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3)
    },
    easeOutElastic: t => {
        if (t === 0) {
            return 0
        }
        if (t === 1) {
            return 1
        }
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
    },
    easeInOutElastic: t => {
        if (t === 0) {
            return 0
        }
        if (t === 1) {
            return 1
        }
        if (t < 0.5) {
            return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2
        }
        return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5)) / 2 + 1
    },

    easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: t => {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        }
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    },
    easeInOutBounce: t => (t < 0.5
        ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
        : (1 + Easing.easeOutBounce(2 * t - 1)) / 2),


    resolve (easing) {
        if (typeof easing === 'function') {
            return easing
        }
        if (typeof easing === 'string' && Easing[easing]) {
            return Easing[easing]
        }
        return Easing.linear
    },


    lerp (start, end, t, easing = 'linear') {
        const easedT = Easing.resolve(easing)(t)
        return start + (end - start) * easedT
    }

}


export default Easing
