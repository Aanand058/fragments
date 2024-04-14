// // src/routes/api/getInfo.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const extConvert = path.extname(req.params.id);
    const fragmentId = path.basename(req.params.id, extConvert);

    if (fragmentId) {
      const fragment = await Fragment.byId(req.user, req.params.id);
      res.status(200).send(createSuccessResponse({ fragment: fragment }));
      logger.info({ fragment }, `Got the fragment info`);
    }
  } catch (err) {
    res.status(404).send(createErrorResponse(404, err));
  }
};
