Remove Blocks Webpack Plugin ![test workflow](https://github.com/kudashevs/remove-blocks-webpack-plugin/actions/workflows/run-tests.yml/badge.svg)
==========================

The `remove-blocks-webpack-plugin` removes marked blocks from any type of code.

## Install

```bash
# NPM
npm install --save-dev remove-blocks-webpack-plugin
# Yarn
yarn add --dev remove-blocks-webpack-plugin
```


## Options

`blocks` is an array of blocks' representations. Each element of this array describes a unique pair of tags with name,
prefix, suffix and optional replacement. These values are represented by a string or an object with the following properties:
```
name: 'devblock'               # a string defines a name for start/end tags (unique)
prefix: '/*'                   # a string defines the beginning of a tag
suffix: '*/'                   # a string defines the end of a tag
replacement: 'optional'        # a string defines a substitution for a removed block
```

The plugin supports zero config. When no options are provided, it uses default name, prefix and suffix values.


## Usage example

For example, suppose the task is to remove some debug information and non-production code from this code sample.
```javascript
function makeFoo(bar, baz) {
    console.log('creating Foo'); 
    
    if (bar instanceof Bar !== true) {
        throw new Error('makeFoo: bar param must be an instance of Bar');
    }
    
    if (baz instanceof Baz !== true) {
        throw new Error('makeFoo: baz param must be an instance of Baz');
    }
    
    return new Foo(bar, baz);
}
```

The plugin removes blocks of code marked with two paired tags (a block). A block is represented by a string or an object
with the properties described in "[Options](#options)" above. Let's identify two different blocks and describe them in the configuration:
```javascript
// webpack.config.js 
const RemoveBlocksPlugin = require('remove-blocks-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new RemoveBlocksPlugin({
      blocks: [
        'debug',
        {
          name: 'development',
          prefix: '//',
          suffix: '',
        },
      ],
    }),
  ],
}
```

Once the blocks are described in the configuration, the unwanted areas of code can be marked in the code:
```javascript
function makeFoo(bar, baz) {
    /* debug:start */ console.log('creating Foo'); /* debug:end */
    // development:start
    if (bar instanceof Bar !== true) {
        throw new Error('makeFoo: bar param must be an instance of Bar');
    }
    // development:end
    // development:start
    if (baz instanceof Baz !== true) {
        throw new Error('makeFoo: baz param must be an instance of Baz');
    }
    // development:end
    // This code will remain
    return new Foo(bar, baz);
}
```

After the building process, the marked blocks will be completely removed.
```javascript
function makeFoo(bar, baz) {
    // This code will remain
    return new Foo(bar, baz);
}
```


## License

The MIT License (MIT). Please see the [License file](LICENSE.md) for more information.
