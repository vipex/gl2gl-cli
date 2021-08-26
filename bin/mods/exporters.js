const fs = require("fs");
const Conf = require("./config");
const Net = require("./net");
const Utils = require("./utils");

const exportWhat = async (what, id) => {
  let queryParams = `?private_token=${Conf.glConfig.from.token}`;

  const http = await Net.rq.create({
    baseURL: `${Conf.glConfig.from.url}/api/v4/${what}/${id}`,
  });

  await http.post(`export${queryParams}`);
  if (what === "project") {
    // These fuckers are still implementing check for groups... -.-'
    await checkStatus(http, `export${queryParams}`);
  }
  return await download(http, `export/download${queryParams}`, id);
};

const checkStatus = (http, uri) => {
  return new Promise((resolve, reject) => {
    const handle = setInterval(() => {
      http
        .get(uri)
        .then((result) => {
          if (result.data["export_status"] === "finished") {
            clearInterval(handle);
            return resolve();
          }
        })
        .catch(reject);
    }, 2 * 1000);
  });
};

const download = async (http, uri, projectPath) => {
  let counter = 0;
  const result = await new Promise((resolve, reject) => {
    const handle = setInterval(() => {
      http
        .get(uri, { responseType: "stream" })
        .then((result) => {
          const resp = checkDownloadResponse(result);
          if (resp) {
            clearInterval(handle);
            return resolve(resp);
          } else {
            console.warn("Download not ready, retry");
            counter++;
          }
          if (counter >= 5) {
            throw new Error(
              `Download still not ready after 5 retries, something went wrong, retry in a while.`
            );
          }
        })
        .catch(checkDownloadResponse);
    }, 5 * 1000);
  });

  const tmp = `${Utils.getTemp()}/${projectPath
    .toString()
    .replace("/", "_")}.tar.gz`;
  const stream = fs.createWriteStream(tmp);
  await asyncWriteStream(result.data, stream);

  console.log(`Saved to: ${tmp}`);

  stream.close();

  return tmp;
};

const checkDownloadResponse = (res) => {
  if (res.status === 200) {
    return res;
  }
  return undefined;
};

const asyncWriteStream = (readable, writable) => {
  return new Promise((resolve, reject) => {
    writable.on("finish", resolve);
    writable.on("error", reject);
    readable.pipe(writable);
  });
};

const exportProject = async (id) => exportWhat("projects", id);
const exportGroup = async (id) => exportWhat("groups", id);

module.exports = { exportProject, exportGroup };
