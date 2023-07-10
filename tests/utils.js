require('isomorphic-fetch');


const getAttribute = (asciidoc, attribute) => {
    const pattern = new RegExp(`:${attribute}: (.*)`)
    const match = asciidoc.match(pattern)

    return match ? match[1] : undefined
}

function globJoin() {
    return Array.from(arguments).join('/')
}

async function getStatusCode(url) {
    const res = await fetch(url)

    return res.status
}

function findLinks(asciidoc) {
    const output = []
    const matches = asciidoc.matchAll(/link:([^\[]*)\[((?:[^\]]*\^?)*)\]/g)

    for (const match of matches) {
        if (match[1].startsWith('http') && !match[1].includes('localhost')) {
            output.push(match[1])
        }
    }

    return output
}

module.exports = {
    getAttribute,
    globJoin,
    getStatusCode,
    findLinks,
}
