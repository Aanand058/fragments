const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const path = require('path');

module.exports = async (req, res) => {
  const query = path.parse(req.params.id);
  let extension = query.ext.split('.').pop();

  try {
    let fragmentData = await Fragment.byId(req.user, query.name);
    let fragment = await fragmentData.getData();

    extension = fragmentData.extConvert(extension);

    if (query.ext == '' || fragmentData.type.endsWith(extension)) {
      res.setHeader('Content-Type', fragmentData.type);
      res.status(200).send(Buffer.from(fragment));
    } else {
      try {
        if (fragmentData.isText || fragmentData.type == 'application/json') {
          let result = await fragmentData.txtConversion(extension);
          res.setHeader('Content-Type', `text/${extension}`);
          res.status(200).send(Buffer.from(result));
        } else {
          let result = await fragmentData.ImgConversion(extension);
          res.setHeader('Content-Type', `image/${extension}`);
          res.status(200).send(result);
        }
      } catch (err) {
        res.status(415).json(createErrorResponse(415, `Not Supported Extension`));
      }
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(404, `Unknown Fragment`));
  }
};
