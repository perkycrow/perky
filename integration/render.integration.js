import {test, expect} from '@playwright/test'


test.describe('render', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/integration/fixtures/render.html')
        await page.waitForSelector('[data-ready="true"]')
    })


    test('canvas renderer draws shapes', async ({page}) => {
        const canvas = page.locator('#canvas2d')
        await expect(canvas).toHaveScreenshot('canvas-shapes.png')
    })


    test('webgl renderer draws shapes', async ({page}) => {
        const canvas = page.locator('#webgl')
        await expect(canvas).toHaveScreenshot('webgl-shapes.png')
    })

})
