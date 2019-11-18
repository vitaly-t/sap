"use strict";

const { serializeError } = require("serialize-error");

const logger = require("./logger");

const errorHandler = (err, req = null, res = null, next = null) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro no servidor';
  const errorTrace = err.errorTrace || serializeError(err) || null;

  if (res && res.sendJsonAndLog) {
    return res.sendJsonAndLog(false, message, statusCode);
  }

  logger.error(message, {
    information: errorTrace,
    statusCode: statusCode,
    sucess: false
  });
  //exit node with error
  process.exit(1);
};
module.exports = errorHandler;
