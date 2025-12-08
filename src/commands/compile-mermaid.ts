import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { glob } from 'glob'

interface MermaidBlock {
  startLine: number
  endLine: number
  content: string
  imageName: string
}

/**
 * Extract mermaid diagrams from AsciiDoc files
 */
function extractMermaidBlocks(filePath: string): MermaidBlock[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const blocks: MermaidBlock[] = []
  
  let inMarkdownBlock = false
  let blockStart = -1
  let mermaidContent: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for [source,markdown] followed by ----
    if (line.trim() === '[source,markdown]' && i + 1 < lines.length && lines[i + 1].trim() === '----') {
      inMarkdownBlock = true
      blockStart = i
      mermaidContent = []
      i++ // Skip the ---- line
      continue
    }
    
    // Check for closing ----
    if (inMarkdownBlock && line.trim() === '----') {
      // Check if the content looks like mermaid (starts with graph, flowchart, sequenceDiagram, etc.)
      const content = mermaidContent.join('\n').trim()
      if (content.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitgraph|journey|requirement)/)) {
        const fileName = path.basename(filePath, '.adoc')
        const blockIndex = blocks.length
        const imageName = `${fileName}-diagram-${blockIndex + 1}`
        
        blocks.push({
          startLine: blockStart,
          endLine: i,
          content: content,
          imageName: imageName
        })
      }
      
      inMarkdownBlock = false
      mermaidContent = []
      continue
    }
    
    // Collect content within markdown block
    if (inMarkdownBlock) {
      mermaidContent.push(line)
    }
  }
  
  return blocks
}

/**
 * Compile mermaid diagram to image
 */
function compileMermaidToImage(mermaidContent: string, outputPath: string, format: 'png' | 'svg' = 'svg'): void {
  // Create temporary mermaid file
  const tempFile = path.join(process.cwd(), '.tmp-mermaid.mmd')
  fs.writeFileSync(tempFile, mermaidContent)
  
  try {
    // Use mermaid-cli to compile
    const outputFile = `${outputPath}.${format}`
    execSync(`mmdc -i "${tempFile}" -o "${outputFile}" -b transparent`, { stdio: 'inherit' })
    console.log(`✓ Generated: ${outputFile}`)
  } catch (error) {
    console.error(`✗ Failed to compile mermaid diagram: ${error}`)
    throw error
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }
  }
}

/**
 * Replace mermaid block with image reference
 */
function replaceMermaidBlock(filePath: string, block: MermaidBlock, imagePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  
  // Calculate the range to replace
  const beforeBlock = lines.slice(0, block.startLine).join('\n')
  const afterBlock = lines.slice(block.endLine + 1).join('\n')
  
  // Create image reference
  const relativeImagePath = path.relative(path.dirname(filePath), imagePath).replace(/\\/g, '/')
  const imageRef = `image::${relativeImagePath}[Relational vs Graph Data Model,width=800,align=center]`
  
  // Reconstruct file content
  const newContent = beforeBlock + '\n\n' + imageRef + '\n\n' + afterBlock
  
  fs.writeFileSync(filePath, newContent)
  console.log(`✓ Updated: ${filePath}`)
}

/**
 * Main function to process AsciiDoc files
 */
async function main() {
  const args = process.argv.slice(2)
  const filePattern = args[0] || 'asciidoc/courses/**/*.adoc'
  const format = (args[1] as 'png' | 'svg') || 'svg'
  
  console.log(`Searching for mermaid diagrams in: ${filePattern}`)
  console.log(`Output format: ${format}\n`)
  
  // Check if mermaid-cli is installed
  try {
    execSync('mmdc --version', { stdio: 'ignore' })
  } catch (error) {
    console.error('✗ mermaid-cli (mmdc) is not installed.')
    console.error('  Install it with: npm install -g @mermaid-js/mermaid-cli')
    console.error('  Or locally: npm install --save-dev @mermaid-js/mermaid-cli')
    process.exit(1)
  }
  
  // Find all AsciiDoc files
  const files = await glob(filePattern)
  
  if (files.length === 0) {
    console.log('No AsciiDoc files found.')
    return
  }
  
  console.log(`Found ${files.length} file(s) to process.\n`)
  
  for (const filePath of files) {
    console.log(`Processing: ${filePath}`)
    
    const blocks = extractMermaidBlocks(filePath)
    
    if (blocks.length === 0) {
      console.log(`  No mermaid diagrams found.\n`)
      continue
    }
    
    console.log(`  Found ${blocks.length} mermaid diagram(s).`)
    
    // Process blocks in reverse order to maintain line numbers
    for (let i = blocks.length - 1; i >= 0; i--) {
      const block = blocks[i]
      const fileDir = path.dirname(filePath)
      const imagesDir = path.join(fileDir, 'images')
      
      // Ensure images directory exists
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true })
      }
      
      const imagePath = path.join(imagesDir, block.imageName)
      
      // Compile mermaid to image
      compileMermaidToImage(block.content, imagePath, format)
      
      // Replace mermaid block with image reference
      replaceMermaidBlock(filePath, block, imagePath)
    }
    
    console.log('')
  }
  
  console.log('✓ Done!')
}

// Run the script
main().catch(console.error)

