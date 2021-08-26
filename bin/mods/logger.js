const LogLevel = {
  ERROR: "error",
  WARN: "warning",
  INFO: "info",
  DEBUG: "debug",
};

const filename = () => {
  const Utils = require("./utils");
  const d = new Date();
  return `${Utils.getTemp()}/glmig-${d.getFullYear()}${
    d.getMonth() + 1
  }${d.getDate()}.log`;
};

const doLog = (type, message) => {
  const fs = require("fs");
  // File
  fs.appendFileSync(
    filename(),
    `${new Date().toLocaleTimeString()} ${type.toUpperCase()}: ${message}\n`
  );
  // Console
  switch (type) {
    case LogLevel.ERROR:
      console.error(message);
      break;
    case LogLevel.WARN:
      console.warn(message);
      break;
    case LogLevel.INFO:
      console.info(message);
      break;
    case LogLevel.DEBUG:
      console.debug(message);
      break;
    default:
      console.log(message);
  }
};

const printLog = () => {
  require("fs").readFile(filename(), function (err, buf) {
    process.stdout.write(buf);
  });
};

module.exports = {
  error: (message) => doLog(LogLevel.ERROR, message),
  warn: (message) => doLog(LogLevel.WARN, message),
  info: (message) => doLog(LogLevel.INFO, message),
  debug: (message) => doLog(LogLevel.DEBUG, message),
  log: (message) => doLog("", message),

  show: printLog,
};
