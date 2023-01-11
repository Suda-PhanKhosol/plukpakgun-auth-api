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

//http://localhost:3333/register
//change get to post
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
            res.json({ status: "error", message: err });
          }
          res.json({ status: "ok" });
        }
      );
    });
  } catch (err) {
    res.json({ err });
  }
});

app.post("/login", jsonParser, function (req, res, next) {
  try {
    connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [req.body.email],
      function (err, user, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        if (user.length === 0) {
          res.json({ status: "error", message: "no user found" });
          return;
        }
        res.json({ status: "ok" });
      }
    );
  } catch (err) {
    res.json({ err });
  }
});

// 80 to 3333
app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333");
});
