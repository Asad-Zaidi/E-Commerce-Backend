const serverless = require("serverless-http");
const app = require("../index"); // your original Express app

module.exports.handler = serverless(app);
