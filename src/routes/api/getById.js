
const { createErrorResponse } = require('../../../src/response');
const { readFragmentData } = require('../../../src/model/data/index');
const { Fragment } = require('../../../src/model/fragment');
var mime = require('mime-types');
const path = require('path');
var md = require('markdown-it')({ html: true });
const sharp = require('sharp');

const convert = async (type, ext, returnedFragment) => {
  if (type == 'text/markdown' && ext == 'text/html') {
    returnedFragment = md.render(returnedFragment.toString());
    returnedFragment.type = 'text/html';
  } else if (
    (type == 'text/markdown' ||
      type == 'text/html' ||
      type == 'application/json' ||
      type == 'text/html') &&
    ext == 'text/html'
  ) {
    returnedFragment.type = 'text/plain';
  } else if (
    type == 'image/png' ||
    type == 'image/jpeg' ||
    type == 'image/webp' ||
    type == 'image/gif'
  ) {
    if (ext == 'image/png') {
      returnedFragment = await sharp(returnedFragment).toFormat('png').toBuffer();
    } else if (ext == 'image/jpeg') {
      returnedFragment = await sharp(returnedFragment).toFormat('jpeg').toBuffer();
    } else if (ext == 'image/webp') {
      returnedFragment = await sharp(returnedFragment).toFormat('webp').toBuffer();
    } else if (ext == 'image/gif') {
      returnedFragment = await sharp(returnedFragment).toFormat('gif').toBuffer();
    }
  }

  return returnedFragment;
};

module.exports = async (req, res) => {
  let metaDataFragment;
  const idExt = path.parse(req.params.id);
  let returnedFragment = await readFragmentData(req.user, idExt.name);

  if (returnedFragment) {
    metaDataFragment = await Fragment.byId(req.user, idExt.name);
  } else {
    const errorResponse = createErrorResponse(404, 'not found');
    return res.status(404).json(errorResponse);
  }

  if (idExt.ext != '') {
    const ext = mime.lookup(idExt.ext);
    if (metaDataFragment.formats.includes(ext)) {
      res.setHeader('Content-Type', ext);
      returnedFragment = await convert(metaDataFragment.type, ext, returnedFragment);
    } else {
      const errorResponse = createErrorResponse(415, 'Invalid extension');
      return res.status(415).json(errorResponse);
    }
  } else {
    res.setHeader('Content-Type', metaDataFragment.type);
  }
  res.setHeader('Content-Length', metaDataFragment.size);
  return res.status(200).send(returnedFragment);
};
