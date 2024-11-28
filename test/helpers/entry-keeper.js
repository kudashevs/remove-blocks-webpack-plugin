const fs = require('fs');
const path = require('path');

const DEFAULT_ENTRY_PATH = '../temp/';
const DEFAULT_ENTRY_FILE = 'fixture.tmp';

class Entry {
  file;
  fd;

  /**
   * The constructor does not create any files because of the symmetry principle.
   * The open operation should be explicit and symmetrical to the close operation.
   */
  constructor() {}

  open(file = DEFAULT_ENTRY_FILE) {
    const fullPath = path.join(__dirname, DEFAULT_ENTRY_PATH, file);

    try {
      this.fd = fs.openSync(fullPath, 'w');
    } catch (err) {
      throw new Error(`Cannot create a file ${fullPath} because ${err.message}`);
    }

    this.file = fullPath;
  }

  write(data) {
    try {
      fs.writeFileSync(this.file, data, {encoding: 'utf-8', flag: 'w'});
    } catch (err) {
      throw new Error(`Cannot write to file ${this.file} because ${err.message}`);
    }
  }

  read() {
    try {
      return fs.readFileSync(this.file, {encoding: 'utf-8'});
    } catch (err) {
      throw new Error(`Cannot read file ${this.file} because ${err.message}`);
    }
  }

  path() {
    return this.file;
  }

  exists() {
    return fs.existsSync(this.file);
  }

  close() {
    fs.close(this.fd);
    fs.unlinkSync(this.file);
  }
}

module.exports = Entry;
