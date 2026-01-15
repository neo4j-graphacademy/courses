import path from 'path'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { glob } from 'glob'

const COURSE_DIRECTORY = path.join(__dirname, '..', '..', 'asciidoc', 'courses')

async function renderMermaidToSvgAndPng(mmdPath: string, browser: any): Promise<void> {
    const mermaidCode = fs.readFileSync(mmdPath, 'utf-8')
    const svgPath = mmdPath.replace('.mmd', '.svg')
    const pngPath = mmdPath.replace('.mmd', '.png')

    // Skip if both files exist and are newer than the .mmd file
    if (fs.existsSync(svgPath) && fs.existsSync(pngPath)) {
        const mmdStats = fs.statSync(mmdPath)
        const svgStats = fs.statSync(svgPath)
        const pngStats = fs.statSync(pngPath)
        if (svgStats.mtime > mmdStats.mtime && pngStats.mtime > mmdStats.mtime) {
            console.log(`⏭️  Skipping ${path.basename(mmdPath)} (SVG and PNG are up to date)`)
            return
        }
    }

    const page = await browser.newPage()

    // Set a larger viewport for better quality
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })

    // Use the code as-is - Mermaid should handle single quotes in init blocks
    const processedCode = mermaidCode

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
            body {
                margin: 0;
                padding: 20px;
                background: #F5F7FA;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            #container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .mermaid {
                font-family: 'Nunito Sans', 'Open Sans', sans-serif;
            }
        </style>
    </head>
    <body>
        <div id="container">
            <div class="mermaid">
${processedCode}
            </div>
        </div>
        <script>
            mermaid.initialize({ 
                startOnLoad: true,
                securityLevel: 'loose',
                theme: 'base'
            });
            
            // Error handling
            window.addEventListener('error', (e) => {
                console.error('Page error:', e.message, e.filename, e.lineno);
            });
        </script>
    </body>
    </html>
    `

    await page.setContent(html)

    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error(`Browser console error for ${path.basename(mmdPath)}: ${msg.text()}`)
        }
    })

    // Wait for Mermaid library to load and render
    await page.waitForFunction(() => {
        return typeof (window as any).mermaid !== 'undefined'
    }, { timeout: 10000 })

    // Wait a bit for Mermaid to process
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Wait for Mermaid to render SVG
    try {
        await page.waitForSelector('.mermaid svg', { timeout: 30000 })
        await new Promise(resolve => setTimeout(resolve, 1000)) // Extra time for final rendering
    } catch (error: any) {
        // Try to get error details
        const errorInfo = await page.evaluate(() => {
            const mermaidEl = document.querySelector('.mermaid')
            if (mermaidEl) {
                return {
                    hasSvg: !!mermaidEl.querySelector('svg'),
                    innerHTML: mermaidEl.innerHTML.substring(0, 200)
                }
            }
            return { hasSvg: false, innerHTML: 'No mermaid element found' }
        })
        console.error(`Failed to render ${path.basename(mmdPath)}: ${error.message}`)
        console.error(`Debug info:`, errorInfo)
        await page.close()
        return
    }

    // Extract SVG content
    const svgElement = await page.$('.mermaid svg')
    if (svgElement) {
        // Get SVG as string
        const svgContent = await page.evaluate((el) => {
            return el.outerHTML
        }, svgElement)

        // Save SVG file
        fs.writeFileSync(svgPath, svgContent, 'utf-8')
        console.log(`✅ Generated ${path.basename(svgPath)}`)

        // Get the container element and screenshot it for PNG
        const container = await page.$('#container')
        if (container) {
            await container.screenshot({
                path: pngPath,
                type: 'png',
                omitBackground: false
            })
            console.log(`✅ Generated ${path.basename(pngPath)}`)
        } else {
            console.error(`❌ Failed to find container for ${mmdPath}`)
        }
    } else {
        console.error(`❌ Failed to find SVG element for ${mmdPath}`)
    }

    await page.close()
}

async function main() {
    console.log('🎨 Generating SVG and PNG files from Mermaid diagrams...\n')

    // Find all .mmd files in the courses directory, excluding schema templates
    const allMmdFiles = await glob(`${COURSE_DIRECTORY}/**/*.mmd`)
    const mmdFiles = allMmdFiles.filter(file => !file.includes('mermaid-theme-schema.mmd'))

    if (mmdFiles.length === 0) {
        console.log('No Mermaid files found.')
        return
    }

    console.log(`Found ${mmdFiles.length} Mermaid file(s)\n`)

    // Launch browser once and reuse for all files
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
        for (const mmdFile of mmdFiles) {
            try {
                await renderMermaidToSvgAndPng(mmdFile, browser)
            } catch (error: any) {
                console.error(`❌ Error processing ${mmdFile}: ${error.message}`)
            }
        }
    } finally {
        await browser.close()
    }

    console.log('\n🎉 Mermaid SVG and PNG generation complete!')
}

main()

