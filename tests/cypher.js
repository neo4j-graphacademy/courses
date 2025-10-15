const neo4j = require('neo4j-driver')

let driver

function initDriver() {
    driver = neo4j.driver(
        process.env.NEO4J_HOST,
        neo4j.auth.basic(
            process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD
        )
    )
}

async function closeDriver() {
    if (driver) {
        await driver.close()
        driver = null
    }
}


function explainCypherError(query) {
    if (query.trim().includes('PROFILE')) {
        query = query.replace('PROFILE ', '')
    }

    const session = driver.session()
    return session.run(`EXPLAIN ${query}`)
        .then(() => undefined)
        .catch(e => {
            return [query, e.message]
        })
        .finally(() => session.close())
}

module.exports = {
    initDriver,
    closeDriver,
    explainCypherError,
}