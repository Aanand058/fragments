// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')();


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
    let f = await listFragments(ownerId, expand);
    return f;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      return new Fragment(await readFragment(ownerId, id))
    } catch (error) {
      throw new Error('Unable to fincd id with that fragment');
    }

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
    let format = [];

    if (this.type.startsWith('text/plain')) {
      format = ['text/plain'];
    }
    else if (this.type.startsWith('text/markdown')) {
      format = ['text/plain', 'text/html', 'text/markdown'];
    } else if (this.type.startsWith('text/html')) {
      format = ['text/plain', 'text/markdown'];
    } else if (this.type.startsWith('application/json')) {
      format = ['application/json', 'text/plain'];
    }
    return format;
  }

  isSupportedExt(ext) {
    if (this.type == 'text/plain' && ext == '.txt') {
      return true;
    } else if (this.type == 'text/markdown') {
      if (ext == '.md' || ext == '.html' || ext == '.txt') {
        return true;
      }
    } else if (this.type == 'text/html') {
      if (ext == '.html' || ext == '.txt') {
        return true;
      }
    } else if (this.type == 'application/json') {
      if (ext == '.json' || ext == '.txt') {
        return true;
      }
    }
    else {
      return false;
    }
  }


  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {

    if (value == 'text/plain' || value == 'text/plain; charset=utf-8'
      || value == 'text/markdown' || value == 'text/html' || value == 'application/json') {
      return true;
    } else {
      return false;
    }
  }





  convertConType(ext) {
    if (ext == '.txt') {
      return 'text/plain';
    } else if (ext == '.md') {
      return 'text/markdown';
    } else if (ext == '.html') {
      return 'text/html';
    } else if (ext == '.json') {
      return 'application/json';
    } else {
      return this.mimeType;
    }
  }


  async convertData(extname) {
    try {
      var fragData = await this.getData();
      var result;
      if (extname == '.txt') {
        result = fragData.toString();
      } else if (this.mimeType == 'text/markdown' && extname == '.html') {
        result = md.render(fragData.toString());
      }
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }

}

module.exports.Fragment = Fragment;
