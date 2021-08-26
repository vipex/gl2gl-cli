const fs = require("fs");
const FormData = require("form-data");
const Conf = require("./config");
const Logger = require("./logger");
const Net = require("./net");
const Utils = require("./utils");

const importGroup = async (name, path, file, parent) => {
  let queryParams = `?private_token=${Conf.glConfig.to.token}`;

  const formData = new FormData();
  formData.append("name", name);
  formData.append("path", path);
  formData.append("file", fs.createReadStream(file), {
    filename: "group.tar.gz",
  });

  if (parent) {
    formData.append("parent_id", parent);
  }

  try {
    const result = await Net.rq.post(
      `${Conf.glConfig.to.url}/api/v4/groups/import${queryParams}`,
      formData,
      {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (result.status > 299) {
      Logger.error(
        `The group ${name} failed to import due to rate limiting! Writing to error log.`
      );
      Logger.log("Awaiting 1 minute to reset rates.");
      await Utils.sleep(60 * 1000);
      Logger.log("Retrying.");
      return importGroup(name, path, file, parent);
    } else {
      return result.data;
    }
  } catch (e) {
    Logger.error(
      `The group failed to import! Writing to error log. ${e.message}`
    );
  }
};

const importProject = async (nameSpace, name, path, file, overwrite) => {
  let queryParams = `?private_token=${Conf.glConfig.to.token}`;

  const formData = new FormData();
  formData.append("namespace", nameSpace);
  formData.append("name", name);
  formData.append("path", path);
  formData.append("file", fs.createReadStream(file), {
    filename: "group.tar.gz",
  });

  if (overwrite) {
    formData.append("overwrite", overwrite);
  }

  try {
    const result = await Net.rq.post(
      `${Conf.glConfig.to.url}/api/v4/projects/import${queryParams}`,
      formData,
      {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    if (result.status > 299) {
      Logger.error(
        `The project ${name} failed to import due to rate limiting! Writing to error log.`
      );
      Logger.log("Awaiting 1 minute to reset rates.");
      await Utils.sleep(60 * 1000);
      Logger.log("Retrying.");
      return importProject(nameSpace, name, path, file, overwrite);
    } else {
      return result.data;
    }
  } catch (e) {
    Logger.error(
      `The project failed to import! Writing to error log. ${e.message}`
    );
  }
};

module.exports = { importGroup, importProject };
