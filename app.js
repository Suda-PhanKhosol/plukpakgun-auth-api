//#region  global variable / declare parameter
//ให้ API เรียกข้าม Domaiin ได้ ไม่มีก็จะใช้ได้แค่ในเครื่องเรา
var express = require("express");
var cors = require("cors");
var app = express();
//อ่านค่า json จาก request
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

app.use(cors());

const Users = require("./modules/Users");

const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerDocument = require("./swagger.json");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./Users.js"],
};

const swaggerSpec = swaggerJSDoc(options);

//Router
const userRouter = require("./modules/Users");
const userRoleRouter = require("./modules/UserRoles");
//#endregion

//#region  config port
// 80 to 3333
//http://localhost:3333/register

// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec, { explorer: true })
// );
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/users", userRouter);
app.use("/userroles", userRoleRouter);

app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333 ");
});

//#endregion
