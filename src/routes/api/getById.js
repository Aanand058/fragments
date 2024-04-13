// src/routes/api/get.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

/**
 * Get a fragment by id
 */
module.exports = async (req, res) => {
  var id = path.parse(req.url).name;
  var extname = path.extname(req.url);

  try {
    var fragment = new Fragment(await Fragment.byId(req.user, id));
    if (extname) {
      if (fragment.isSupportedExt(extname)) {
        res.setHeader('content-type', fragment.convertContentType(extname));
        res.status(200).send(await fragment.convertData(extname));
      } else {
        res
          .status(415)
          .json(
            createErrorResponse(415, `This fragment does not support conversions of ${extname}`)
          );
      }
    } else {
      var fragmentData = await fragment.getData();
      res.status(200).setHeader('content-type', fragment.type).send(fragmentData);
    }
  } catch (err) {
    logger.error(err);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
