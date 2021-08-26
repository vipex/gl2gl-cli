const Exporters = require("./mods/exporters");
const Fetch = require("./mods/fetcher");
const Containers = require("./mods/containers");
const GroupCommands = require("./grp.cmd");
const Projects = require("./mods/projects");
const Importers = require("./mods/importers");
const Logger = require("./mods/logger");
const Utils = require("./mods/utils");

const help = `
Projects command help: 
  (empty) [%filter] : Shows list of projects (filter should start with %)
  [c|containers] {id} : Shows specific project's container list (if any)
  [h|help]      : Print this help
  [s|show] {id} : Shows specific project's information
  [m|migrate] {id} : Try to migrate the specific project
  [a|archive] {id} : Try to archive the specific project
  
  options:
    --force : force fetch from server
    --target : works on target gitlab instead of the source
`;

/***
 * Parse the Project commands
 *
 * @param cmd string[] whit the parameters only
 */
const ProjectCommands = async (cmd) => {
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
        const p = await Fetch.fetchProject(+cmd[1], force, target);
        if (p) {
          console.log(p);
        }
      }
      return;
    case "c":
    case "containers":
      if (Utils.validateID(cmd[1])) {
        const c = await Containers.list(+cmd[1], force, target);
        if (c && c.length) {
          c.map((t) => console.log(`${t.name} ( ${t.location} )`));
          console.log(`\n\n Total of ${c.length} tags.`);
        }
      }
      return;
    case "cm":
      if (Utils.validateID(cmd[1])) {
        const p = await Fetch.fetchProject(+cmd[1], true);
        const ps = await Fetch.fetchAllProjects(true, true);
        Utils.printList(
          ps
            .sort((a, b) => Utils.sortString(a.name, b.name))
            .map((i) => `${i.id} - ${i.name} (/${i.path_with_namespace})`)
        );
        const px = await Utils.promptInput(`Select destination project:`);
        const pt = await Fetch.fetchProject(+px, true, true);
        await Containers.migrate(p, pt);
      }
      return;
    case "m":
    case "migrate":
      if (Utils.validateID(cmd[1])) {
        const id = +cmd[1];
        try {
          const p = await Fetch.fetchProject(id, true);
          const path = p.path.toLowerCase().replace(" ", "_");

          let g;
          if (!Utils.validateID(cmd[2])) {
            await GroupCommands(["g", "--force", "--target"]);
            g = await Utils.promptInput(`Select destination group:`);
          } else {
            g = +cmd[2];
          }

          const OK = await Utils.promptInput(
            `Migrating project ${id} with these characteristics: \n - Namespace: ${g} \n - Name: ${p.name}\n - Path: ${path}\nConfirm? (Y/n): `
          );
          if (["y", ""].includes(OK.toString().toLowerCase())) {
            console.log("Starting export...");
            const file = await Exporters.exportProject(id);
            console.log("Importing into target...");
            const np = await Importers.importProject(
              g,
              p.name,
              path,
              file,
              false
            );
            console.log("Repository migration done.");

            const ARC = await Utils.promptInput(`Archive project? (Y/n): `);
            if (["y", ""].includes(ARC.toString().toLowerCase())) {
              await Projects.archive(id);
            }

            // Containers
            const c = await Containers.list(+cmd[1], true);
            if (c.length) {
              const CM = await Utils.promptInput(
                `There are ${c.length} registry images for this project, try the automatic migration?\n` +
                  `To be successful you need to have docker installed and been already logged on both source and target registry.\n` +
                  `Continue? (y/N): `
              );
              if (["y", ""].includes(CM.toString().toLowerCase())) {
                console.log("Starting containers migration...");
                await Containers.migrate(p, np);
                console.log("Container migration concluded.");
              }
            }
          }
        } catch (e) {
          Logger.error("Error during project migration", e.message);
        }
      }
      return;
    case "a":
    case "archive":
      if (Utils.validateID(cmd[1])) {
        const id = +cmd[1];
        try {
          const p = await Projects.archive(id, target);
          if (p && p.archived) {
            Logger.log("Project archived correctly");
          }
        } catch (e) {
          Logger.error("Error during project archiving", e.message);
        }
      }
      return;
    default:
      const filter = cmd.find((c) => c.startsWith("%"));
      // fetch all
      const p = await Fetch.fetchAllProjects(force, target);
      if (p) {
        Utils.printList(
          p
            .sort((a, b) => Utils.sortString(a.name, b.name))
            .filter(
              (p) =>
                !filter ||
                p.name.toLowerCase().includes(filter.toLowerCase().substr(1))
            )
            .map(
              (i) =>
                `${i.id} - ${i.archived ? "[A]" : ""} ${i.name} (/${
                  i.path_with_namespace
                })`
            )
        );
      }
  }
};

module.exports = ProjectCommands;
