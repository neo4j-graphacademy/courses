const getAttribute = (asciidoc, attribute) => {
    const pattern = new RegExp(`:${attribute}: (.*)`)
    const match = asciidoc.match(pattern)

    return match ? match[1] : undefined
}

module.exports = {
    getAttribute,
}
