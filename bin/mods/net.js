const axios = require("axios");
const Logger = require("./logger");

const err = (e) => {
  switch (("" + e.response.status)[0]) {
    case "3":
      Logger.warn("Cannot access this element:\n\t", e.message);
      return;
    case "4":
      Logger.warn("Element not found:\n\t", e.message);
      return;
    case "5":
      Logger.error("Server error:\n\t", e.message);
      return;
    default:
      throw new Error(
        `Something went wrong with code ${e.response.status}: \n\t ${e.message}`
      );
  }
};

module.exports = { rq: axios, err };
