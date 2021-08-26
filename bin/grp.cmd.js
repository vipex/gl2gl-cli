const Exporters = require("./mods/exporters");
const Fetch = require("./mods/fetcher");
const Importers = require("./mods/importers");
const Logger = require("./mods/logger");
const ProjectCommands = require("./prj.cmd");
const Utils = require("./mods/utils");

const help = `
Groups command help: 
  (empty) [%filter] : Shows list of groups (filter should start with %)
  [h|help]      : Print this help
  [s|show] {id} : Shows specific group's information
  [m|migrate] {id} : Try to migrate the specific group
  [mp|migrateprj] {id} : Try to migrate all the project in the specific group at once
  
  options:
    --force : force fetch from server
    --target : works on target gitlab instead of the source
`;

/***
 * Parse the Group commands
 *
 * @param cmd string[] whit the parameters only
 */
const GroupCommands = async (cmd) => {
  const force = cmd.includes("--force");
  const target = cmd.includes("--target");
  const test = cmd[0] || "";

  switch (test.toLowerCase()) {
    case "h":
    case "help":
      console.log(help);
      return;
    case "s":
    case "show":
      if (Utils.validateID(cmd[1])) {
        const g = await Fetch.fetchGroup(+cmd[1], force, target);
        if (g) {
          const info =
            `id: ${g.id}\n` +
            `name: ${g.name}\n` +
            `path: ${g.path}\n` +
            `projects: \n` +
            g.projects.reduce(
              (a, p) =>
                a +
                `   ${p.id} - ${p.archived ? "[A]" : ""} ${p.name} (${
                  p.path
                })\n`,
              ""
            );
          console.log(info);
        }
      }
      return;
    case "m":
    case "migrate":
      if (Utils.validateID(cmd[1])) {
        const id = +cmd[1];
        try {
          const g = await Fetch.fetchGroup(id, true);
          const path = g.path.toLowerCase().replace(" ", "_");
          const OK = await Utils.promptInput(
            `Migrating group ${id} with these characteristics: \n - Name: ${g.name}\n - Path: ${path}\nConfirm? (Y/n): `
          );
          if (["y", ""].includes(OK.toString().toLowerCase())) {
            console.log("Starting export...");
            const file = await Exporters.exportGroup(id);
            console.log("Importing into target...");
            await Importers.importGroup(g.name, path, file);
            console.log("Done.");
          }
        } catch (e) {
          Logger.error("Error during group migration", e.message);
        }
      }
      return;
    case "mp":
    case "migrateprj":
      if (Utils.validateID(cmd[1])) {
        const id = +cmd[1];
        try {
          const g = await Fetch.fetchGroup(id, true);
          if (g && g.projects && g.projects.length) {
            await GroupCommands(["g", "--force", "--target"]);
            const ns = await Utils.promptInput(`Select destination group:`);

            const OK = await Utils.promptInput(
              `Migrating ${g.projects.length} projects to the ${ns} namespace,\nConfirm? (Y/n): `
            );
            if (["y", ""].includes(OK.toString().toLowerCase())) {
              for (let p of g.projects) {
                await ProjectCommands(["m", p.id, ns]);
              }
            }
          }
        } catch (e) {
          Logger.error("Error during group migration", e.message);
        }
      }
      return;
    default:
      const filter = cmd.find((c) => c.startsWith("%"));
      // fetch all
      const g = await Fetch.fetchAllGroups(force, target);

      if (g) {
        Utils.printList(
          g
            .sort((a, b) => Utils.sortString(a.name, b.name))
            .filter(
              (g) =>
                !filter ||
                g.name.toLowerCase().includes(filter.toLowerCase().substr(1))
            )
            .map((i) => `${i.id} - ${i.name} (/${i.path})`)
        );
      }
  }
};

module.exports = GroupCommands;
