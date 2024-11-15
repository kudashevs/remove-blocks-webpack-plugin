const fs = require('fs');
const path = require('path');

const ENTRY_PATH = path.resolve(__dirname, '../temp/entry.tmp');

class Entry {
  static open() {
    fs.openSync(ENTRY_PATH, 'w');
  }

  static write(data) {
    try {
      fs.writeFileSync(ENTRY_PATH, data, {encoding: 'utf-8', flag: 'w'});
    } catch (err) {
      throw new Error(`Cannot write to file ${ENTRY_PATH} because ${err.message}`);
    }
  }

  static read() {
    try {
      return fs.readFileSync(ENTRY_PATH, {encoding: 'utf-8'});
    } catch (err) {
      throw new Error(`Cannot read file ${ENTRY_PATH} because ${err.message}`);
    }
  }

  static path() {
    return ENTRY_PATH;
  }

  static exists() {
    return fs.existsSync(ENTRY_PATH);
  }

  static close() {
    fs.unlinkSync(ENTRY_PATH);
  }
}

module.exports = Entry;
