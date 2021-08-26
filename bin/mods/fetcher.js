const Conf = require("./config");
const Net = require("./net");
const Utils = require("./utils");

const fetchAll = async (what, force, target) => {
  const where = target ? "to" : "from";
  const cacheFile = `${what}_${where}.json`;
  const all = [];

  if (!force && Utils.existsFile(cacheFile)) {
    console.log("[Results from cache]");
    return Utils.fromFile(cacheFile);
  }

  let page = 1;
  let result = [];
  let queryString = `private_token=${Conf.glConfig[where].token}&simple=true&per_page=100`;

  do {
    try {
      result = await Net.rq.get(
        `${Conf.glConfig[where].url}/api/v4/${what}?${queryString}&page=${page}`
      );
    } catch (e) {
      Net.err(e);
      return;
    }

    page++;
    all.push(...result.data);
  } while (result.data.length > 0);

  Utils.toFile(all, cacheFile);
  return all;
};
const fetchOne = async (what, force, id, target) => {
  const where = target ? "to" : "from";
  const cacheFile = `${what}_${where}_${id}.json`;
  let result = {};
  let queryString = `private_token=${Conf.glConfig[where].token}&simple=true`;

  if (!force && Utils.existsFile(cacheFile)) {
    console.log("[Results from cache]");
    return Utils.fromFile(cacheFile);
  }

  try {
    result = await Net.rq.get(
      `${Conf.glConfig[where].url}/api/v4/${what}/${id}?${queryString}`
    );
    Utils.toFile(result.data, cacheFile);
    return result.data;
  } catch (e) {
    Net.err(e);
  }
};

const fetchAllProjects = async (force, target) =>
  fetchAll("projects", force, target);
const fetchAllGroups = async (force, target) =>
  fetchAll("groups", force, target);
const fetchProject = async (id, force, target) =>
  fetchOne("projects", force, id, target);
const fetchGroup = async (id, force, target) =>
  fetchOne("groups", force, id, target);

module.exports = { fetchAllProjects, fetchProject, fetchAllGroups, fetchGroup };
