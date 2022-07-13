const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "tvvrzg",
  chromeWebSecurity: false,

  env: {
    setup_url: "/test/reset",
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
});
