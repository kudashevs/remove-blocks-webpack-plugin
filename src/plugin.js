// @ts-check
'use strict';

const RemoveBlocks = require('remove-blocks');
const {RawSource} = require('webpack-sources');
const {isEmptyArray, isNotSet} = require('./utils');

const EXCLUDE_MODES = ['development'];
const DEFAULT_NAME = 'devblock';
const DEFAULT_TAG_PREFIX = '/*';
const DEFAULT_TAG_SUFFIX = '*/';

class RemoveBlocksWebpackPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const pluginName = 'RemoveBlocksWebpackPlugin';
    const isWebpack5 = compiler.webpack && compiler.webpack.version >= '5';

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      if (this.shouldSkipProcessing(compiler.options.mode || process.env.NODE_ENV)) {
        return;
      }

      if (isWebpack5) {
        const {webpack} = compiler;
        const {Compilation} = webpack;
        const {RawSource} = webpack.sources;

        // prettier-ignore
        compilation.hooks.processAssets.tap({
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        }, assets => {
          try {
            this.processAssets(compilation, assets, RawSource);
          } catch (err) {
            throw new Error(`Compilation failed with ${err.message}`);
          }
        });
      } else {
        compilation.hooks.afterOptimizeAssets.tap(pluginName, assets => {
          try {
            this.processAssets(compilation, assets, RawSource);
          } catch (err) {
            compilation.errors.push(`Compilation failed with ${err.message}`);
          }
        });
      }
    });
  }

  processAssets(compilation, assets, RawSource) {
    compilation.getAssets().forEach(({name, source}) => {
      const modified = this.remove(source.source(), this.options);

      compilation.updateAsset(name, new RawSource(modified));
    });
  }

  /**
   * @param {string} mode
   * @return {boolean}
   */
  shouldSkipProcessing(mode) {
    return EXCLUDE_MODES.includes(mode);
  }

  remove(content, options) {
    if (this.shouldUseDefaults(options)) {
      options.blocks = [this.generateDefaultBlock()];
    }

    return RemoveBlocks(content, options);
  }

  /**
   * @param {Object} options
   * @param {Array<string|Object>|undefined} [options.blocks]
   * @returns {boolean}
   */
  shouldUseDefaults(options) {
    return isNotSet(options.blocks) || isEmptyArray(options.blocks);
  }

  /**
   * @param {string} [name=DEFAULT_NAME]
   * @return {{name:string, prefix: string, suffix: string}}
   */
  generateDefaultBlock(name = DEFAULT_NAME) {
    return {
      name: `${name}`,
      prefix: DEFAULT_TAG_PREFIX,
      suffix: DEFAULT_TAG_SUFFIX,
    };
  }
}

module.exports = RemoveBlocksWebpackPlugin;
