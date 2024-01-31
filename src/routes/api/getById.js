
// src/routes/api/getById.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  const id = path.parse(req.url).name;

  try {
    const fragment = new Fragment(await Fragment.byId(req.user, id));
    const fragmentData = await fragment.getData();

    res.status(200).setHeader('content-type', 'text/plain').send(fragmentData);
  } catch (err) {
    logger.error(err);
    res.status(404).send(createErrorResponse(404, 'Fragment not found'));
  }
};

