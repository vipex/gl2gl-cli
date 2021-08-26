const inquirer = require("inquirer");
const fs = require("fs");
const os = require("os");
const Logger = require("./logger");

const promptInput = async (message) => {
  const { input } = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message,
    },
  ]);

  return input;
};

const getTemp = () => {
  const tmp = `${os.tmpdir()}/glmig`;

  fs.mkdirSync(tmp, { recursive: true });
  return tmp;
};

const cleanTemp = async () => {
  const tmp = getTemp();
  const content = fs.readdirSync(tmp);

  if (content.length === 0) {
    return;
  }
  content.map((c) => console.log(c));
  const OK = await promptInput("Cancellare tutto? (y/N): ");
  if (OK.toString().toLowerCase() === "y") {
    for (const f of content) {
      fs.unlinkSync(tmp + "/" + f);
    }
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const toFile = (data, name) => {
  const file = `${getTemp()}/${name}`;
  if (typeof data === "object") {
    fs.writeFileSync(file, JSON.stringify(data));
  } else {
    fs.writeFileSync(file, data);
  }
};

const fromFile = (name) => {
  const file = `${getTemp()}/${name}`;
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, "utf8");
      if (typeof data === "string") {
        return JSON.parse(data);
      }
      return data;
    }
    return undefined;
  } catch (e) {
    Logger.error("Error in `fromFile`" + e.message);
    return undefined;
  }
};

const existsFile = (name) => {
  const file = `${getTemp()}/${name}`;
  return fs.existsSync(file);
};

const printList = (list) => {
  const MAX = 50;
  const cols = Math.floor(process.stdout.columns / MAX);
  const rows = list.length / cols;

  let i = 0;
  for (let r = 0; r < rows; r++) {
    let rw = "";
    for (let c = 0; c < cols; c++) {
      if (i >= list.length) break;

      let s = list[i];
      if (s.length > MAX - 1) {
        rw += "" + s.substr(0, MAX - 4) + "... ";
      } else {
        rw += s + " ".repeat(MAX - s.length);
      }
      i++;
    }
    console.log(rw);
  }
};

const validateID = (id) => {
  if (id && !isNaN(+id) && +id > 0) {
    return true;
  }

  console.warn("Provide a valid numeric ID!");
  return false;
};

// Sorters
const sortNumeric = (a, b) => a - b;
const sortString = (a, b) => (a > b ? 1 : b > a ? -1 : 0);

module.exports = {
  cleanTemp,
  existsFile,
  fromFile,
  getTemp,
  printList,
  promptInput,
  sleep,
  sortNumeric,
  sortString,
  toFile,
  validateID,
};
