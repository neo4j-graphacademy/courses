import path from 'path'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { glob } from 'glob'

const COURSE_DIRECTORY = path.join(__dirname, '..', '..', 'asciidoc', 'courses')

async function renderMermaidToPng(mmdPath: string): Promise<void> {
    const mermaidCode = fs.readFileSync(mmdPath, 'utf-8')
    const outputPath = mmdPath.replace('.mmd', '.png')
    
    // Skip if PNG already exists and is newer than the .mmd file
    if (fs.existsSync(outputPath)) {
        const mmdStats = fs.statSync(mmdPath)
        const pngStats = fs.statSync(outputPath)
        if (pngStats.mtime > mmdStats.mtime) {
            console.log(`⏭️  Skipping ${path.basename(mmdPath)} (PNG is up to date)`)
            return
        }
    }

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set a larger viewport for better quality
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
    
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
            <pre class="mermaid">
${mermaidCode}
            </pre>
        </div>
        <script>
            mermaid.initialize({ 
                startOnLoad: true,
                theme: 'base',
                themeVariables: {
                    fontFamily: 'Nunito Sans, Open Sans, sans-serif',
                    fontSize: '14px'
                }
            });
        </script>
    </body>
    </html>
    `
    
    await page.setContent(html)
    
    // Wait for Mermaid to render
    await page.waitForSelector('.mermaid svg', { timeout: 10000 })
    await new Promise(resolve => setTimeout(resolve, 500)) // Extra time for animations
    
    // Get the container element and screenshot it
    const container = await page.$('#container')
    if (container) {
        await container.screenshot({
            path: outputPath,
            type: 'png',
            omitBackground: false
        })
        console.log(`✅ Generated ${path.basename(outputPath)}`)
    } else {
        console.error(`❌ Failed to find container for ${mmdPath}`)
    }
    
    await browser.close()
}

async function main() {
    console.log('🎨 Generating PNG files from Mermaid diagrams...\n')
    
    // Find all .mmd files in the courses directory
    const mmdFiles = await glob(`${COURSE_DIRECTORY}/**/*.mmd`)
    
    if (mmdFiles.length === 0) {
        console.log('No Mermaid files found.')
        return
    }
    
    console.log(`Found ${mmdFiles.length} Mermaid file(s)\n`)
    
    for (const mmdFile of mmdFiles) {
        try {
            await renderMermaidToPng(mmdFile)
        } catch (error: any) {
            console.error(`❌ Error processing ${mmdFile}: ${error.message}`)
        }
    }
    
    console.log('\n🎉 Mermaid PNG generation complete!')
}

main()

