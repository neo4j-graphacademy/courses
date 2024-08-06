import buildHtml from '../services/build-html';

const start = Date.now()

buildHtml()
  .then(() => {
    const end = Date.now()

    console.log(`⌚️ Completed in ${end - start}ms`)
  })
