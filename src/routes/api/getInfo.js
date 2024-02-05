// src/routes/api/getInfo.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');


module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const fragment = await Fragment.byId(req.user, id);
    res.status(200).send(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(404).send(createErrorResponse(404, 'Not found'));
  }
};
