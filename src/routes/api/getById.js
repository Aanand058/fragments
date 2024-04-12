//https://github.com/markdown-it/markdown-it
var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt();

const sharp = require('sharp');

const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragmentFound = await Fragment.byId(req.user, req.params.id);

    const fragment = new Fragment({
      id: fragmentFound.id,
      ownerId: fragmentFound.ownerId,
      type: fragmentFound.type,
      created: fragmentFound.created,
      updated: fragmentFound.updated,
      size: fragmentFound.size,
    });

    if (Fragment.isSupportedType(fragment.type)) {
      //conversion extensions
      //1 .html
      if (req.params.ext === 'html') {
        //1.1 only text/markdown or text/html can be converted to .html
        if (fragment.type === 'text/markdown' || fragment.type === 'text/html') {
          const getData = await fragment.getData();
          const data = md.render(`${getData}`);
          res.setHeader('Content-Type', 'text/html');
          res.status(200).send(data);
        } else {
          res.status(415).json(createErrorResponse(415, 'Cannot convert to .html'));
        }
      }
      //2 .txt
      else if (req.params.ext === 'txt') {
        if (
          fragment.type === 'text/plain' ||
          fragment.type === 'text/markdown' ||
          fragment.type === 'text/html' ||
          fragment.type === 'application/json'
        ) {
          const data = await fragment.getData();
          res.setHeader('Content-Type', 'text/plain');
          res.status(200).send(data);
        } else {
          res.status(415).json(createErrorResponse(415, 'Cannot convert to .txt'));
        }
      }
      //3 .md
      else if (req.params.ext === 'md') {
        if (fragment.type === 'text/markdown') {
          const data = await fragment.getData();
          res.setHeader('Content-Type', 'text/markdown');
          res.status(200).send(data);
        } else {
          res.status(415).json(createErrorResponse(415, 'Cannot convert to .md'));
        }
      }
      //4 .json
      else if (req.params.ext === 'json') {
        if (fragment.type === 'application/json') {
          const data = await fragment.getData();
          res.setHeader('Content-Type', 'application/json');
          res.status(200).send(data);
        } else {
          res.status(415).json(createErrorResponse(415, 'Cannot convert to .json'));
        }
      }
      //5 .png .jpg, .webp, .git
      else if (
        req.params.ext === 'png' ||
        req.params.ext === 'jpg' ||
        req.params.ext === 'webp' ||
        req.params.ext === 'gif'
      ) {
        if (
          fragment.type === 'image/png' ||
          fragment.type === 'image/jpeg' ||
          fragment.type === 'image/webp' ||
          fragment.type === 'image/gif'
        ) {
          const getData = await fragment.getData();

          const data = await sharp(getData).toFormat(req.params.ext).toBuffer();
          const fragmentType = 'image/' + req.params.ext;
          res.setHeader('Content-Type', fragmentType);
          res.status(200).send(data);
        } else {
          res.status(415).json(createErrorResponse(415, 'Cannot convert'));
        }
      }
      //6 no specified extension
      else if (typeof req.params.ext === 'undefined') {
        const data = await fragment.getData();
        res.setHeader('Content-Type', fragment.type);
        res.status(200).send(data);
      } else {
        res.status(415).json(createErrorResponse(415, 'Not support converting'));
      }
    } else {
      res.status(415).json(createErrorResponse(415, 'Content type not supported'));
    }
  } catch (err) {
    logger.error({ err }, 'error on get a fragment');

    res.status(404).json(createErrorResponse(404, 'not get by id'));
  }
};
