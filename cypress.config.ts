import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "tvvrzg",
  chromeWebSecurity: false,
  env: {
    setup_url: "/test/reset",
    neo4j_uri: "neo4j://localhost:7687",
    neo4j_username: "neo4j",
    neo4j_password: "neo",
    user_email: 'graphacademy@neo4j.com',
    user_password: 'thisisatestpasswordforalocalinstance',
  },

  viewportWidth: 1400,
  viewportHeight: 2000,
  defaultCommandTimeout: 20000,

  retries: {
    openMode: 0,
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
