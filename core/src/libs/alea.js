// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
// Warning : Toxicode adapted it to requirejs only (simplified). And refactor (faster than original)

// next.int32 = function() { return (random() * 0x100000000) | 0; }
// next.double = function() {
//     return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
// };

// STRANGE : getting rid of the me object and using bare vars c, s0, s1, s2 is far slower !!

// Warning : PerkyCrow adapted it to ES6 modules


export function alea (seedOrState) {
    let me = {}

    function next () {
        let t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10
        me.s0 = me.s1
        me.s1 = me.s2
        return me.s2 = t - (me.c = t | 0) // eslint-disable-line
    }

    next.state = function () {
        return {
            c: me.c,
            s0: me.s0,
            s1: me.s1,
            s2: me.s2
        }
    }


    next.setState = function ({
        c, s0, s1, s2
    }) {
        me.c = c
        me.s0 = s0
        me.s1 = s1
        me.s2 = s2
    }


    next.setSeed = function (seed) {
        setSeed(me, String(seed))
    }


    if (typeof seedOrState === 'object' && 's0' in seedOrState) {
        next.setState(seedOrState)
        return next
    }

    setSeed(me, String(seedOrState))

    return next
}


// Seeding algorithm from Baagoe, slightly optimized by Pierre Lancien
export function setSeed (me, seed) {
    let mash = getMash()
    me.c = 1
    me.s0 = 0.8633289230056107 - mash(seed)
    if (me.s0 < 0) {
        me.s0 += 1
    }
    me.s1 = 0.15019597788341343 - mash(seed)
    if (me.s1 < 0) {
        me.s1 += 1
    }
    me.s2 = 0.9176952994894236 - mash(seed)
    if (me.s2 < 0) {
        me.s2 += 1
    }
    mash = null
}


export function getMash () {
    let n = 0xeaee1443

    function mash (string) {
        for (let i = 0; i < string.length; i++) {
            n += string.charCodeAt(i)
            let h = 0.02519603282416938 * n
            n = h >>> 0 // eslint-disable-line
            h = (h - n) * n
            n = h >>> 0 // eslint-disable-line
            n += (h - n) * 0x100000000
        }
        return (n >>> 0) * 2.3283064365386963e-10 // eslint-disable-line
    }

    return mash
}


export default alea
