'use strict';

/**
 * @param {Object} obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
  return isObject(obj) && Object.keys(obj).length === 0;
}

/**
 * @param {Array} arr
 * @returns {boolean}
 */
function isEmptyArray(arr) {
  return Array.isArray(arr) && arr.length === 0;
}

/**
 * @param {Object} obj
 * @returns {boolean}
 */
function isObject(obj) {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

module.exports = {isEmptyObject, isEmptyArray};
