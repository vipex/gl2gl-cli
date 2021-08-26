#!/usr/bin/env node
const GlMig = require("./glmig");
const app = new GlMig();
app.run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
