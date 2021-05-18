# GraphAcademy

## Installation

1. Install Dependencies
```
npm install
```

2. Configure `.env`

```
ASCIIDOC_DIRECTORY=asciidoc

AUTH0_BASE_URL=http://localhost:3000
AUTH0_CLIENT_ID=XXX
AUTH0_CLIENT_SECRET=XXX
AUTH0_ISSUER_BASE_URL=https://neo4j-sync.auth0.com

NEO4J_HOST=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=neo

SANDBOX_URL=https://efz1cnte2e.execute-api.us-east-1.amazonaws.com/main/
```



## Running in Development Mode

Running in development mode will start a server at http://localhost:3000 and watch for changes.

```
npm run dev
```

### Mock Sandbox Integration

To stop the server from creating sandbox databases you can configure the API to return the same credentials regardless of use case:

```
SANDBOX_DEV_INSTANCE_ID=139f44bf53e91b10e9465bb9918e1660
SANDBOX_DEV_INSTANCE_HASH_KEY=139f44bf53e91b10e9465bb9918e1660
SANDBOX_DEV_INSTANCE_SCHEME=neo4j
SANDBOX_DEV_INSTANCE_HOST=localhost
SANDBOX_DEV_INSTANCE_PORT=7687
SANDBOX_DEV_INSTANCE_USERNAME=neo4j
SANDBOX_DEV_INSTANCE_PASSWORD=neo
```

### Watch for changes to `.adoc` files

Running the following command will listen for changes and merge the course catalogue into the database.

```
npm run watch
```

## Building for Production

```
npm run build
```