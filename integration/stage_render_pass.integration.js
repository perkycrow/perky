import {test, expect} from '@playwright/test'
import {getPixelColor} from './test_helpers.js'


test.describe('stage render pass', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/integration/fixtures/stage_render_pass.html')
        await page.waitForSelector('[data-ready="true"]')
    })


    test('normal stage has no post passes', async ({page}) => {
        const passCount = await page.evaluate(() => window.getPostPassCount())

        expect(passCount).toBe(0)
    })


    test('inverted stage applies post pass', async ({page}) => {
        await page.evaluate(() => window.setStage('inverted'))

        const passCount = await page.evaluate(() => window.getPostPassCount())

        expect(passCount).toBe(1)
    })


    test('switching back to normal stage removes post pass', async ({page}) => {
        await page.evaluate(() => window.setStage('inverted'))
        await page.evaluate(() => window.setStage('normal'))

        const passCount = await page.evaluate(() => window.getPostPassCount())

        expect(passCount).toBe(0)
    })


    test('normal stage renders red rectangle', async ({page}) => {
        const canvas = page.locator('#game-container canvas')
        await expect(canvas).toHaveScreenshot('stage-normal.png')
    })


    test('inverted stage renders with inverted colors', async ({page}) => {
        await page.evaluate(() => window.setStage('inverted'))

        const canvas = page.locator('#game-container canvas')
        await expect(canvas).toHaveScreenshot('stage-inverted.png')
    })


    test('normal stage has red pixels', async ({page}) => {
        const canvas = page.locator('#game-container canvas')
        const pixel = await getPixelColor(page, canvas)

        expect(pixel.r).toBe(255)
        expect(pixel.g).toBe(0)
        expect(pixel.b).toBe(0)
    })


    test('inverted stage has cyan pixels', async ({page}) => {
        await page.evaluate(() => window.setStage('inverted'))

        const canvas = page.locator('#game-container canvas')
        const pixel = await getPixelColor(page, canvas)

        expect(pixel.r).toBe(0)
        expect(pixel.g).toBe(255)
        expect(pixel.b).toBe(255)
    })


    test('game postPass persists when stage adds its postPass', async ({page}) => {
        await page.evaluate(() => window.addGamePostPass())
        expect(await page.evaluate(() => window.getPostPassCount())).toBe(1)

        await page.evaluate(() => window.setStage('inverted'))
        expect(await page.evaluate(() => window.getPostPassCount())).toBe(2)
    })


    test('game postPass persists when stage postPass is removed', async ({page}) => {
        await page.evaluate(() => window.addGamePostPass())
        await page.evaluate(() => window.setStage('inverted'))
        expect(await page.evaluate(() => window.getPostPassCount())).toBe(2)

        await page.evaluate(() => window.setStage('normal'))
        expect(await page.evaluate(() => window.getPostPassCount())).toBe(1)
    })


    test('game greenPass renders green rectangle', async ({page}) => {
        await page.evaluate(() => window.addGamePostPass())

        const canvas = page.locator('#game-container canvas')
        await expect(canvas).toHaveScreenshot('stage-green.png')

        const pixel = await getPixelColor(page, canvas)
        expect(pixel.r).toBe(0)
        expect(pixel.g).toBe(255)
        expect(pixel.b).toBe(0)
    })


    test('game greenPass + stage invertPass renders magenta', async ({page}) => {
        await page.evaluate(() => window.addGamePostPass())
        await page.evaluate(() => window.setStage('inverted'))

        const canvas = page.locator('#game-container canvas')
        await expect(canvas).toHaveScreenshot('stage-green-inverted.png')

        const pixel = await getPixelColor(page, canvas)
        expect(pixel.r).toBe(255)
        expect(pixel.g).toBe(0)
        expect(pixel.b).toBe(255)
    })


    test('removing stage invertPass restores green', async ({page}) => {
        await page.evaluate(() => window.addGamePostPass())
        await page.evaluate(() => window.setStage('inverted'))
        await page.evaluate(() => window.setStage('normal'))

        const canvas = page.locator('#game-container canvas')
        await expect(canvas).toHaveScreenshot('stage-green-restored.png')

        const pixel = await getPixelColor(page, canvas)
        expect(pixel.r).toBe(0)
        expect(pixel.g).toBe(255)
        expect(pixel.b).toBe(0)
    })

})
