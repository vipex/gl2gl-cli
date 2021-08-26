const Conf = require("./config");
const Net = require("./net");

const archive = async (id, target) => {
  const where = target ? "to" : "from";
  let result = {};
  let queryString = `private_token=${Conf.glConfig[where].token}`;

  try {
    result = await Net.rq.post(
      `${Conf.glConfig[where].url}/api/v4/projects/${id}/archive?${queryString}`
    );
    return result.data;
  } catch (e) {
    Net.err(e);
  }
};

module.exports = { archive };
