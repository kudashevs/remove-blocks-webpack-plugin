'use strict';

const loaderUtils = require('loader-utils');
const removeBlocks = require('remove-blocks');
const {isEmptyObject, isEmptyArray} = require('./utils');

const EXCLUDE_MODES = ['development'];
const DEFAULT_NAME = 'devblock';
const TAG_PREFIX = '/*';
const TAG_SUFFIX = '*/';

const defaultOptions = {
  blocks: [generateDefaultBlock(DEFAULT_NAME)],
};

/**
 * @param {string} label
 *
 * @return {Object}
 */
function generateDefaultBlock(label) {
  return {
    name: `${label}`,
    prefix: TAG_PREFIX,
    suffix: TAG_SUFFIX,
  };
}

/**
 * @param {string} content
 *
 * @return {string}
 *
 * @throws Error
 */
function RemoveBlocks(content) {
  if (shouldSkipProcessing(this.mode || process.env.NODE_ENV)) {
    return content;
  }

  const options = loaderUtils.getOptions(this) || {};

  if (shouldUseDefaults(options)) {
    options.blocks = defaultOptions.blocks;
  }

  try {
    content = removeBlocks(content, options);
  } catch (e) {
    throw e;
  }

  if (this.cacheable) {
    this.cacheable(true);
  }

  return content;
}

/**
 * @param {string} mode
 *
 * @return {boolean}
 */
function shouldSkipProcessing(mode) {
  return EXCLUDE_MODES.includes(mode);
}

function shouldUseDefaults(options) {
  return isEmptyObject(options) || isEmptyArray(options.blocks);
}

module.exports = RemoveBlocks;
