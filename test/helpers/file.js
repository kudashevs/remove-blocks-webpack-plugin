const fs = require('fs');
const path = require('path');

class File {
  constructor(file) {
    const filePath = path.resolve(__dirname, file);

    this.name = filePath;
    this.fd = fs.openSync(filePath, 'w');
  }

  write(data) {
    try {
      fs.writeFileSync(this.fd, data);
    } catch (err) {
      throw new Error(`Cannot write to file ${this.name} because ${err.message}`);
    }
  }

  read() {
    try {
      return fs.readFileSync(this.name, 'utf8');
    } catch (err) {
      throw new Error(`Cannot read file ${this.name} because ${err.message}`);
    }
  }

  remove() {
    fs.closeSync(this.fd);
    fs.unlinkSync(this.name);
  }
}

module.exports = File;
