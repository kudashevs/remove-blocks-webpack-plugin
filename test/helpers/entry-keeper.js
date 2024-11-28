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
    file = path.join(__dirname, DEFAULT_ENTRY_PATH, file);

    try {
      Entry.fd = fs.openSync(file, 'w');
    } catch (err) {
      throw new Error(`Cannot create a file ${file} because ${err.message}`);
    }

    Entry.file = file;
  }

  write(data) {
    try {
      fs.writeFileSync(Entry.file, data, {encoding: 'utf-8', flag: 'w'});
    } catch (err) {
      throw new Error(`Cannot write to file ${Entry.file} because ${err.message}`);
    }
  }

  read() {
    try {
      return fs.readFileSync(Entry.file, {encoding: 'utf-8'});
    } catch (err) {
      throw new Error(`Cannot read file ${Entry.file} because ${err.message}`);
    }
  }

  path() {
    return Entry.file;
  }

  exists() {
    return fs.existsSync(Entry.file);
  }

  close() {
    fs.close(Entry.fd);
    fs.unlinkSync(Entry.file);
  }
}

module.exports = Entry;
