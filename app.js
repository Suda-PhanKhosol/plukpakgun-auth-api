//#region  global variable / declare parameter
//ให้ API เรียกข้าม Domaiin ได้ ไม่มีก็จะใช้ได้แค่ในเครื่องเรา
var express = require("express");
var cors = require("cors");
var app = express();
//อ่านค่า json จาก request
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
//hash password เพื่อความปลอดภัย
const bcrypt = require("bcrypt");
const saltRounds = 10;
//
var jwt = require("jsonwebtoken");
const secret = "Fullstack-Login-2021"; //รหัสลับใช้ gen token ห้ามเผยแพร่

app.use(cors());

// get the client
const mysql = require("mysql2");

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "mydb", //db ของเรา
});

//#endregion

//#region register
app.post("/register", jsonParser, function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var fname = req.body.fname;
  var lname = req.body.lname;

  try {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      connection.execute(
        "INSERT INTO users (email,password,fname,lname) values  (?,?,?,?)",
        [email, hash, fname, lname],
        function (err, results, fields) {
          if (err) {
            return res.json({ status: "error", message: err });
          }
          return res.json({ status: "ok" });
        }
      );
    });
  } catch (err) {
    return res.json({ err });
  }
});
//#endregion

//#region login
app.post("/login", jsonParser, function (req, res, next) {
  try {
    connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [req.body.email],
      function (err, users, fields) {
        if (err) {
          return res.json({ status: "error", message: err });
        }
        if (users.length === 0) {
          return res.json({ status: "error", message: "no user found" });
        }

        bcrypt.compare(
          req.body.password,
          users[0].password,
          function (err, isLogin) {
            if (isLogin) {
              var token = jwt.sign({ email: users[0] }, secret, {
                expiresIn: "1h",
              });
              return res.json({
                status: "ok",
                message: "login success",
                token,
              });
            }
            //ส่ง token กลับไป
            else {
              return res.json({ status: "error", message: "Invalid password" });
            }
          }
        );
      }
    );
  } catch (err) {
    return res.json({ err });
  }
});
//#endregion

//#region authen
//authen ว่า token ที่ได้จากการ login ตรงไหม ถูกไหม
app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    //ตรวจสอบ token ว่าเป็นของใครและตรงไหมถ้าตรงจะ return ข้อมูล token ของคนนั้นๆที่ login ไว้ตอนแรก
    var decoded = jwt.verify(token, secret);
    return res.json({ status: "ok", decoded });
  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
});
//#endregion

//#region test
app.get("/test/:id", jsonParser, function (req, res, next) {
  return res.send(req.params.id);
});
//#endregion

//#region  config port
// 80 to 3333
//http://localhost:3333/register

app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333 ");
});

//#endregion
