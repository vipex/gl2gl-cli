const proc = require("child_process");

const Conf = require("./config");
const Logger = require("./logger");
const Net = require("./net");
const Utils = require("./utils");

const registries = async (id, force, target) => {
  const where = target ? "to" : "from";
  const cacheFile = `registries_${where}_${id}.json`;
  let result = {};
  let queryString = `private_token=${Conf.glConfig[where].token}&simple=true`;

  if (!force && Utils.existsFile(cacheFile)) {
    console.log("[Results from cache]");
    return Utils.fromFile(cacheFile);
  }

  try {
    result = await Net.rq.get(
      `${Conf.glConfig[where].url}/api/v4/projects/${id}/registry/repositories/?${queryString}`
    );
    Utils.toFile(result.data, cacheFile);
    return result.data;
  } catch (e) {
    Net.err(e);
  }
};

const tags = async (project, registry, force, target) => {
  const where = target ? "to" : "from";
  const cacheFile = `tags_${where}_${project}_${registry}.json`;
  let result = {};
  let queryString = `private_token=${Conf.glConfig[where].token}&simple=true`;

  if (!force && Utils.existsFile(cacheFile)) {
    return Utils.fromFile(cacheFile);
  }

  try {
    result = await Net.rq.get(
      `${Conf.glConfig[where].url}/api/v4/projects/${project}/registry/repositories/${registry}/tags?${queryString}`
    );
    Utils.toFile(result.data, cacheFile);
    return result.data;
  } catch (e) {
    Net.err(e);
  }
};

const list = async (project, force, target) => {
  const regs = await registries(project, force, target);
  const conts = [];

  for (let reg of regs) {
    conts.push(...(await tags(project, reg.id, force, target)));
  }

  return conts;
};

const migrate = async (source, target) => {
  // Use docker commands
  const c = await list(source.id, true);
  const s = `${Conf.glConfig.from.registry}/${source.path_with_namespace}`;
  const t = `${Conf.glConfig.to.registry}/${target.path_with_namespace}`;

  // Migrate images
  for (const d of c) {
    // exec the migrate script
    try {
      proc.execSync(
        `${__dirname}/../cmds/docker-migrate.sh "${d.location}" "${s}" "${t}"`,
        {
          encoding: "utf8",
          shell: "/bin/bash",
        }
      );
      Logger.log(`${d.location} done.`);
    } catch (e) {
      Logger.error(`Error migrating ${d.location}`, e.message);
    }
  }

  // Cleanup local images
  for (const d of c) {
    // exec the cleanup script
    try {
      proc.execSync(
        `${__dirname}/../cmds/docker-cleanup.sh "${d.location}" "${s}" "${t}"`,
        {
          encoding: "utf8",
          shell: "/bin/bash",
        }
      );
      Logger.info(`${d.location} cleaned.`);
    } catch (e) {
      Logger.warn(`Error cleaning ${d.location}`, e.message);
    }
  }
};

module.exports = { list, migrate };
