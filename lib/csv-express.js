/*
  csv-express
  Forked and modified by John J Czaplewski <jczaplew@gmail.com>

  Copyright 2011 Seiya Konno <nulltask@gmail.com>
  MIT Licensed
 */


'use strict';

var res = require('http').ServerResponse.prototype;
var iconv = require('iconv-lite');

// Configurable settings
exports.separator = ',';
exports.preventCast = false;
exports.ignoreNullOrUndefined = true;

/*
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
  if (!isNaN(parseFloat(field)) && isFinite(field)) {
    return parseFloat(field);
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

 /*
  Send CSV response

  {data} - Array objects or arrays
  {csvHeaders} - If true uses the keys of the objects in {obj} to set a header row
  {headers} - Optional response headers
  {stats} - Optional status code
 */

res.csv = function(data, csvHeaders, headers, status) {
  var body = '';
  var headerRow = [];

  this.charset = this.charset || 'utf-8';
  this.header('Content-Type', 'text/csv');

  // headerRow is used to ensure key order
  for (var prop in data[0]) {
    if (data[0].hasOwnProperty(prop)) {
      headerRow.push(prop);
    }
  }

  // Append the header row to the response if requested
  if (csvHeaders) {
    body += headerRow + '\r\n';
  }

  // Convert the data to a CSV-like structure
  for (var i = 0; i < data.length; i++) {
    if (!(data[i] instanceof Array)) {
      data[i] = headerRow.map(function(key) {
        if (data[i].hasOwnProperty(key)) {
          return data[i][key];
        } else {
          return null;
        }
      })
    }

    body += data[i].map(escape).join(exports.separator) + '\r\n';
  }

  if (this.charset !== 'utf-8') {
    body = iconv.encode(body, this.charset);
  }

  return this.send(body, headers, status);
}
