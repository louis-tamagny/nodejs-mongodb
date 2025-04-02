const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Hello World",
      version: "1.0.0",
    },
  },
  apis: ["./routes/*.js", "./models/*.js"],
};


module.exports = [swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options))];
