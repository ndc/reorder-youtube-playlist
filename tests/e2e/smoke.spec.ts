import { test, expect } from '@playwright/test'

// Simple smoke to ensure dev server serves index
 test('home page renders heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Reorder YouTube Playlist')
})
