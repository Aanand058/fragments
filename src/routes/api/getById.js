
// src/routes/api/getById.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  const id = path.parse(req.url).name;
  const ext = path.extname(req.url);


  try {
    const fragment = new Fragment(await Fragment.byId(req.user, id));
    const fragmentData = await fragment.getData();
    if (ext) {
      if (fragment.isSupportedExt(ext)) {
        res.status(200).setHeader('content-type', fragment.convertConType(ext))
          .send(await fragment.convertFragmentData(ext));
      }
      else {
        res.status(415).send(createErrorResponse(415, 'Not supported extension'));
      }
    } else {

      res.status(200).setHeader('content-type', fragment.type).send(fragmentData);
    }
  } catch (err) {
    logger.error(err);
    res.status(404).send(createErrorResponse(404, 'Fragment not found'));
  }
};

