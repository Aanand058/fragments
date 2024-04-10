// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, req.query.expand);
    res.status(200).send(createSuccessResponse({ fragments }));
  } catch (error) {
    res.status(404).send(createErrorResponse(404, error));
  }
};
