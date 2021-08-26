const Conf = require("./mods/config");
const Logger = require("./mods/logger");
const Utils = require("./mods/utils");
const Group = require("./grp.cmd");
const Project = require("./prj.cmd");

const help = `
GlMig command help: 
  clear : Clear the console
  exit : Exits the CLI 
  [g|grp|group] : Group related commands ( 'g help' to get details ) 
  [h|help] : Shows this help
  [i|info] : Shows the current configuration
  log : Print today's log
  [p|prg|project] : Project related commands ( 'p help' to get details )
`;

module.exports = class GlMig {
  async run() {
    try {
      await Conf.ensureConf();
    } catch (err) {
      if (err.type) {
        process.exitCode = 1;
        return;
      }
      throw err;
    }

    let command;
    do {
      command = await Utils.promptInput("glmig> ");
      await this.parseCommand(command);
    } while (command.toLowerCase() !== "exit");
  }

  /***
   * Parse the input command
   *
   * @param command string Command complete string
   */
  async parseCommand(command) {
    const cmd = command.split(" ");
    switch (cmd[0].toLowerCase()) {
      case "i":
      case "info":
        console.log("Configuration:\n", Conf.glConfig);
        console.log("Temp:\n", Utils.getTemp());
        return;
      case "clear":
        process.stdout.write("\u001b[2J\u001b[0;0H");
        return;
      case "cleanup":
        await Utils.cleanTemp();
        return;
      case "log":
        Logger.show();
        return;
      case "g":
      case "grp":
      case "group":
        // Group command parser
        await Group(cmd.slice(1));
        return;
      case "p":
      case "prj":
      case "project":
        // Project command parser
        await Project(cmd.slice(1));
        return;
      case "exit":
        return;
      case "h":
      case "help":
        console.log(help);
        return;
      default:
      // do nothing
    }
  }
};
