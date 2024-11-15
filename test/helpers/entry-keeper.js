const fs = require('fs');
const path = require('path');

const ENTRY_PATH = '../temp/';
const ENTRY_FILE = 'fixture.tmp';

class Entry {
  static file;

  static open(file = ENTRY_FILE) {
    file = path.join(__dirname, ENTRY_PATH, file);

    try {
      fs.openSync(file, 'w');
    } catch (err) {
      throw new Error(`Cannot create a file ${file} because ${err.message}`);
    }

    Entry.file = file;
  }

  static write(data) {
    try {
      fs.writeFileSync(Entry.file, data, {encoding: 'utf-8', flag: 'w'});
    } catch (err) {
      throw new Error(`Cannot write to file ${Entry.file} because ${err.message}`);
    }
  }

  static read() {
    try {
      return fs.readFileSync(Entry.file, {encoding: 'utf-8'});
    } catch (err) {
      throw new Error(`Cannot read file ${Entry.file} because ${err.message}`);
    }
  }

  static path() {
    return Entry.file;
  }

  static exists() {
    return fs.existsSync(Entry.file);
  }

  static close() {
    fs.unlinkSync(Entry.file);
  }
}

module.exports = Entry;
