import {test, expect} from '@playwright/test'


test.describe('application', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/integration/fixtures/application.html')
        await page.waitForSelector('[data-ready="true"]', {timeout: 10000})
    })


    test('loads image assets from manifest', async ({page}) => {
        const assetCount = await page.locator('body').getAttribute('data-asset-count')
        expect(assetCount).toBe('2')
    })


    test('logo is a valid loaded image', async ({page}) => {
        const logoLoaded = await page.locator('body').getAttribute('data-logo-loaded')
        expect(logoLoaded).toBe('true')
    })


    test('pig is a valid loaded image', async ({page}) => {
        const pigLoaded = await page.locator('body').getAttribute('data-pig-loaded')
        expect(pigLoaded).toBe('true')
    })


    test('loaded images are displayed', async ({page}) => {
        const images = page.locator('#assets img')
        await expect(images).toHaveCount(2)
    })

})
