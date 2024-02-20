// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

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
    const result = await readFragment(ownerId, id);
    if (!result) {
      throw new Error('Not Found');
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
    if (!data) {
      throw new Error('Data Error');
    }
    this.updated = new Date().toISOString();
    this.size = data.byteLength;
    return writeFragmentData(this.ownerId, this.id, data);
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

}

module.exports.Fragment = Fragment;
