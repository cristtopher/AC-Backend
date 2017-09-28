'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT
    || process.env.PORT
    || 8080,

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI
      || process.env.MONGOHQ_URL
      || process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME
      || 'mongodb://axxezodb:OHO7eBCZFRx6LJObtemhHQvEn7Xy0WK3xuKrpc19ANZ7O7Z1knSKRXveoQ1mvPvcWa1dPI1FMwpKxBbhQEmU0Q==@axxezodb.documents.azure.com:10255/unwp?ssl=true&authSource=admin'
  }
};
