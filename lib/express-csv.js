/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var http = require('http')
  , express = require('express')
  , res = express.response || http.ServerResponse.prototype;

/**
 * Import package information.
 */
var package = require('../package');

/**
 * Library version.
 */
exports.version = package.version;

/**
 * CSV separator
 */
exports.separator = ',';

/**
 * Prevent Excel's casting.
 */
exports.preventCast = false;

/**
 * Ignore `null` or `undefined`
 */
exports.ignoreNullOrUndefined = true;

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */
function escape(field) {
  if (exports.ignoreNullOrUndefined && field == undefined) {
    return '';
  }
  if (exports.preventCast) {
    return '="' + String(field).replace(/\"/g, '""') + '"';
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

/**
 * Convert an object to an array of property values.
 *
 * Example:
 *    objToArray({ name: "john", id: 1 })
 *    // => [ "john", 1 ]
 *
 * @param {Object} obj The object to convert.
 * @return {Array} The array of object properties.
 * @api private
 */
function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
}

/**
 * Convert an object to an array of key values for a header.
 *
 * Example:
 *    objToArray({ name: "john", id: 1 })
 *    // => [ "name", "id" ]
 *
 * @param {Object} obj The object to convert.
 * @return {Array} The array of object keys.
 * @api private
 */
function getObjKeys(obj) {
  var result = [];
  Object.keys(obj).forEach(function(key) {
    result.push(key);
  });
  return result;
  
}

/**
 * Send CSV response with `obj`, optional `headers`, and optional `status`.
 *
 * @param {Array} obj
 * @param {Object|String|Number} headers or filename or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */
csv = function(obj, headers, status) {
  var body = '';

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');
  //var page = this.req.route.path.split('/').pop();
  //if(this.get('Content-disposition') == null)
  //  this.header('Content-disposition', 'attachment; filename=' + page + '.csv');
  // headers parameter handle this filename thing
  if(typeof headers == 'string'){
    this.header('Content-Disposition', 'attachment; filename="'+headers+'"' );
  } else if(headers instanceof Object)  {
  } else {
    this.header('Content-Disposition', 'attachment; filename="download.csv"' );
  } 
  if (!(obj instanceof Array)) {
    item = getObjKeys(obj[0]);
    body += item.map(escape).join(exports.separator) + '\r\n';
  } else {
    obj.forEach(function(item) {
      if (!(item instanceof Array)) item = objToArray(item);
      body += item.map(escape).join(exports.separator) + '\r\n';
    });
  }

  return this.send(body, headers, status);
};

/**
 * Add method to response object
 */

if (express.response)
  express.response.csv = csv
if (http.ServerResponse)
  http.ServerResponse.prototype.csv = csv

