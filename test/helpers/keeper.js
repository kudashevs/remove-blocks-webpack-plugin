const fs = require('fs');
const path = require('path');

const FIXTURE_PATH = path.resolve(__dirname, '../temp/test-storage.tmp');

class Fixture {
  static open() {
    fs.openSync(FIXTURE_PATH, 'w');
  }

  static write(data) {
    try {
      fs.writeFileSync(FIXTURE_PATH, data, {encoding: 'utf-8', flag: 'w'});
    } catch (err) {
      throw new Error(`Cannot write to file ${FIXTURE_PATH} because ${err.message}`);
    }
  }

  static read() {
    try {
      return fs.readFileSync(FIXTURE_PATH, {encoding: 'utf-8'});
    } catch (err) {
      throw new Error(`Cannot read file ${FIXTURE_PATH} because ${err.message}`);
    }
  }

  static path() {
    return FIXTURE_PATH;
  }

  static close() {
    fs.unlinkSync(FIXTURE_PATH);
  }
}

module.exports = Fixture;
