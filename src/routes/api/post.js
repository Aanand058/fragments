const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const apiUrl = process.env.API_URL;

module.exports = async (req, res) => {
  try {
    const contentType = req.get('Content-Type');

    if (!Fragment.isSupportedType(contentType)) {
      return res.status(415).send(createErrorResponse(415, 'Content-Type is not supported'));
    }

    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });

    await fragment.setData(req.body);
    await fragment.save();

    const locationHeader = `${apiUrl}/v1/fragments/${fragment.id}`;
    res.set('location', locationHeader).status(201).send(createSuccessResponse({ fragment }));
  } catch (err) {
    res.status(404).send(createErrorResponse(404, 'Unable to POST fragment'));
  }
};
