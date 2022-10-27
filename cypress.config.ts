import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "tvvrzg",
  chromeWebSecurity: false,
  env: {
    setup_url: "/test/reset",
    user_email: "adam+graphacademy@neo4j.com",
    user_password: "GraphAcademy2021",
    neo4j_uri: "neo4j://localhost:7687",
    neo4j_username: "neo4j",
    neo4j_password: "neo",
  },

  viewportWidth: 1400,
  viewportHeight: 2000,
  defaultCommandTimeout: 20000,

  retries: {
    openMode: 3,
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
