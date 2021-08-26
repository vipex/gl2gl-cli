const Conf = require("conf");
const Utils = require("./utils");

const cfg = new Conf({
  schema: {
    from: {
      token: { type: "string" },
      url: {
        type: "string",
        format: "url",
      },
      registry: { type: "string" },
    },
    to: {
      token: { type: "string" },
      url: {
        type: "string",
        format: "url",
      },
      registry: { type: "string" },
    },
  },
});

const glConfig = {
  from: cfg.get("from"),
  to: cfg.get("to"),
};

const ensureConf = async () => {
  if (
    !glConfig.from ||
    !glConfig.from.token ||
    !glConfig.from.url ||
    !glConfig.from.registry
  ) {
    console.log("FROM Gitlab Configuration");
    glConfig.from = {
      url: await Utils.promptInput("Gitlab URI:"),
      token: await Utils.promptInput("Gitlab Token (with sudo): "),
      registry: await Utils.promptInput("Gitlab Registry: "),
    };

    if (!glConfig.from.url || !glConfig.from.token) {
      const err = new Error("Wrong From configuration");
      err.type = "no-from-config";
      throw err;
    }

    cfg.set("from", glConfig.from);
  }
  if (
    !glConfig.to ||
    !glConfig.to.token ||
    !glConfig.to.url ||
    !glConfig.to.registry
  ) {
    console.log("TO Gitlab Configuration");
    glConfig.to = {
      url: await Utils.promptInput("Gitlab URI:"),
      token: await Utils.promptInput("Gitlab Token: "),
      registry: await Utils.promptInput("Gitlab Registry: "),
    };

    if (!glConfig.to.url || !glConfig.to.token) {
      const err = new Error("Wrong From configuration");
      err.type = "no-to-config";
      throw err;
    }

    cfg.set("to", glConfig.to);
  }
};

module.exports = { glConfig, ensureConf };
