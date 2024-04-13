// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')();
const sharp = require('sharp');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');


class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {

    this.id = id || randomUUID();

    if (!ownerId) {
      throw new Error('ownerId Error');
    } else {
      this.ownerId = ownerId;
    }

    if (Fragment.isSupportedType(type)) {
      this.type = type;
    } else {
      throw new Error('Type Error');
    }

    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();

    if (typeof size != 'number' || size < 0) {
      throw new Error('Size must be  greater than 0 and should be a number.');
    } else {
      this.size = size;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    let fragments = await listFragments(ownerId, expand);
    return Promise.resolve(fragments)
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const result = await readFragment(ownerId, id);
    if (!result) {
      throw new Error('Not Exist or Has been deleted');
    }
    return result;

  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    try {
      if (!data) {
        return Promise.reject(new Error('Data cannot be empty.'));
      }
      this.updated = new Date().toISOString();
      this.size = data.length;
      await writeFragment(this);
      await writeFragmentData(this.ownerId, this.id, data);
    } catch (err) {
      Promise.reject(err);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.type == 'text/plain' || this.type == 'text/plain; charset=utf-8') {
      return ['text/plain'];
    } else if (this.type == 'text/markdown') {
      return ['text/markdown', 'text/html', 'text/plain'];
    } else if (this.type == 'text/html') {
      return ['text/html', 'text/plain'];
    } else if (this.type == 'application/json' || this.type == 'application/json; charset=utf-8') {
      return ['text/plain', 'application/json'];
    } else if (
      this.type == 'image/png' ||
      this.type == 'image/jpeg' ||
      this.type == 'image/webp' ||
      this.type == 'image/gif'
    ) {
      return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
    return [];
  }



  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {

    if (value == 'text/plain' || value == 'text/plain; charset=utf-8'
      || value == 'text/markdown' || value == 'text/html' || value == 'application/json'
      || value == 'image/jpeg' || value == 'image/png' || value == 'image/webp' ||
      value == 'image/gif') {
      return true;
    } else {
      return false;
    }
  }



  isSupportedExt(extname) {
    if (this.type == 'text/plain' && extname == '.txt') {
      return true;
    } else if (this.type == 'text/markdown') {
      if (extname == '.md' || extname == '.html' || extname == '.txt') {
        return true;
      }
    } else if (this.type == 'text/html') {
      if (extname == '.html' || extname == '.txt') {
        return true;
      }
    } else if (this.type == 'application/json') {
      if (extname == '.json' || extname == '.txt') {
        return true;
      }
    } else if (
      this.type == 'image/png' ||
      this.type == 'image/jpeg' ||
      this.type == 'image/webp' ||
      this.type == 'image/gif'
    ) {
      if (extname == '.png' || extname == '.jpg' || extname == '.webp' || extname == '.gif') {
        return true;
      }
    } else {
      return false;
    }
  }

  // Returns the corresponding type according to extname
  convertContentType(extname) {
    if (extname == '.txt') {
      return 'text/plain';
    } else if (extname == '.md') {
      return 'text/markdown';
    } else if (extname == '.html') {
      return 'text/html';
    } else if (extname == '.json') {
      return 'application/json';
    } else if (extname == '.png') {
      return 'image/png';
    } else if (extname == '.jpg') {
      return 'image/jpeg';
    } else if (extname == '.webp') {
      return 'image/webp';
    } else if (extname == '.gif') {
      return 'image/gif';
    } else {
      return this.mimeType;
    }
  }

  // Convert format according to extname
  async convertData(extname) {
    try {
      var data = await this.getData();
      var converted;
      if (extname == '.txt') {
        converted = data.toString();
      } else if (this.mimeType == 'text/markdown' && extname == '.html') {
        converted = md.render(data.toString());
      }
      if (extname == '.png') {
        converted = await sharp(data).png().toBuffer();
      } else if (extname == '.jpg') {
        converted = await sharp(data).jpeg({ quality: 100, chromaSubsampling: '4:4:4' }).toBuffer();
      } else if (extname == '.webp') {
        converted = await sharp(data).webp({ lossless: true }).toBuffer();
      } else if (extname == '.gif') {
        converted = await sharp(data).gif().toBuffer();
      }
      return converted;
    } catch (err) {
      throw new Error(err);
    }
  }




}

module.exports.Fragment = Fragment;
