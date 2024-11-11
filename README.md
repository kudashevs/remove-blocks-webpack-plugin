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

`blocks` an array of blocks' representations. Each element of this array describes a unique pair of tags with name,
prefix, and suffix. These values are represented by a string or an object with the following properties:
```
name: 'devblock',              # string value defines the name of start/end tags (unique)
prefix: '/*',                  # string value defines the beginning of a tag
suffix: '*/',                  # string value defines the end of a tag
```


## License

The MIT License (MIT). Please see the [License file](LICENSE.md) for more information.
