import buildHtml from '../services/build-html-parallel';

const start = Date.now()

buildHtml()
  .then(() => {
    const end = Date.now()
    const duration = ((end - start) / 1000).toFixed(2)

    console.log(`⌚️ Completed in ${duration}s (${end - start}ms)`)
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  })

