//#region  Variable
//chat gpt : create  file node.js connect phpmyadmin for function CRUD user and product with swagge
const express = require("express");
const router = express.Router();
const userCommFunc = require("../common/functions/UsersCommonFunction");
const connectionStr = require("../common/Connection/DbConnection");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

const bcrypt = require("bcrypt");
const saltRounds = 10;
const guidCaller = require("../common/functions/UsersCommonFunction");
var responses = require("../Models/CommonResponse");
const secret = "Fullstack-Login-2021"; //รหัสลับใช้ gen token ห้ามเผยแพร่
var jwt = require("jsonwebtoken");

//#endregion

//Get all Users
router.get("/getAll", (req, res) => {
  try {
    const sql = "SELECT * FROM users";
    var responseData = responses;
    connectionStr.connection.execute(sql, (error, result) => {
      if (error) {
        var errors = responses.error;
        errors.message = err.message;
        res.send(errors);
      }
      res.send({ ...responses.success, data: result });
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(errors);
  }
});

//Ger Userby Id
router.get("/getById/:id", jsonParser, (req, res) => {
  try {
    getById(req.params.id, function (data) {
      res.send(data);
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(errors);
  }
});

//Register user
router.post("/register", jsonParser, (req, res) => {
  try {
    saveUser("", req.body, function (data) {
      res.send(data);
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(errors);
  }
});

//Login
router.post("/login", jsonParser, (req, res) => {
  try {
    var sql = `SELECT * FROM users WHERE email = '${req.body.Email}'`;
    connectionStr.connection.execute(sql, (err, users) => {
      if (err) {
        var errors = responses.error;
        errors.message = err.message;
        res.send(error.message);
      }
      if (users.length === 0) {
        return res.send(responses.notFound);
      }
      bcrypt.compare(
        req.body.Password,
        users[0].Password,
        function (err, isLogin) {
          // res.send({ body: req.body.Password, user: users[0].Password });
          if (isLogin) {
            var token = jwt.sign({ email: users[0] }, secret, {
              expiresIn: "1h",
            });
            return res.status(200).json({ ...responses.success, token: token });
          }
          //ส่ง token กลับไป
          else {
            return res.json({ status: "error", message: "Invalid password" });
          }
        }
      );
    });
  } catch (error) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(error.message);
  }
});

//authen ว่า token ที่ได้จากการ login ตรงไหม ถูกไหม
router.post("/authen", jsonParser, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    //ตรวจสอบ token ว่าเป็นของใครและตรงไหมถ้าตรงจะ return ข้อมูล token ของคนนั้นๆที่ login ไว้ตอนแรก
    var decoded = jwt.verify(token, secret);
    return res.json({ ...responses.success, data: decoded });
  } catch (err) {
    return res.json({ status: "error", message: err.message });
  }
});

//Update user
router.put("/update/:id", jsonParser, (req, res) => {
  try {
    //find
    getById(req.params.id, function (data) {
      if (data.status !== 200) {
        res.send(data);
      } else {
        saveUser(req.params.id, req.body, function (data) {
          res.send(data);
        });
      }
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(errors);
  }
});

//Delete user
router.delete("/delete/:id", jsonParser, (req, res) => {
  try {
    //find
    getById(req.params.id, function (data) {
      if (data.status !== 200) {
        res.send(data);
      } else {
        //update
        var sqlDelete = `UPDATE users SET IsActive = '0' WHERE ID = '${data.data[0].ID}'`;
        connectionStr.connection.execute(sqlDelete, (err) => {
          if (err) {
            var errors = responses.error;
            errors.message = err.message;
            res.send(error.message);
          }
          res.send(responses.success);
        });
      }
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    res.send(errors);
  }
});

//#region  Functions
const getById = (id, callBack) => {
  try {
    const sql = `SELECT * FROM users WHERE id = '${id}'`;
    connectionStr.connection.execute(sql, (error, result) => {
      if (error) {
        var errors = responses.error;
        errors.message = err.message;
        callBack(errors);
      }
      if (result.length === 0) {
        callBack({ ...responses.notFound, data: [] });
      }
      callBack({ ...responses.success, data: result });
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    callBack(errors);
  }
};

const saveUser = (id, object, callBack) => {
  try {
    // Get the current date and time in JavaScript
    var date = new Date();

    // Convert the date to a string with the format "YYYY-MM-DD HH:mm:ss"
    var dateString =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();

    var requestBody = {};

    requestBody.email = object.Email;
    requestBody.password = object.Password;
    requestBody.firstName = object.FirstName;
    requestBody.lastName = object.LastName;
    requestBody.phoneNumber = object.PhoneNumber;
    requestBody.birthDate =
      object.BirthDate == null ||
      object.BirthDate == undefined ||
      object.BirthDate == ""
        ? "-"
        : object.BirthDate;
    requestBody.isActive = true;
    requestBody.createdBy = object.CreatedBy;
    requestBody.createdDate = dateString;
    requestBody.updatedDate = dateString;
    requestBody.updatedBy = object.UpdatedBy;

    //validate field
    var validateMsg = "";
    //กรอกเมลมาแต่ผิด format
    if (
      requestBody.email !== "" &&
      !userCommFunc.validateEmail(requestBody.email)
    ) {
      validateMsg += "Invalid email format.";
    }
    //required email
    if (requestBody.email === "") {
      validateMsg += "Please input field email.";
    }
    //required firstName
    if (requestBody.firstName == "")
      validateMsg += "Please input filed firstname.";
    //required lastName
    if (requestBody.lastName == "")
      validateMsg += "Please input filed firstname.";
    //required password
    if (requestBody.password === "") {
      validateMsg += "Please input field password.";
    }
    //required phone
    if (requestBody.phoneNumber === "") {
      validateMsg += "Please input field phone number.";
    }
    //length phone
    if (requestBody.phoneNumber.length < 9) {
      validateMsg += "Phone number should be more than 8 digits.";
    }
    //validate number only of phoneNumber
    if (!userCommFunc.validateNumberOnly(requestBody.phoneNumber)) {
      validateMsg += "Please input field  only number phone number.";
    }
    if (requestBody.password !== "") {
      //1: The password length is at least 8 characters
      //2 : The password contains at least one digit (0-9)
      //3 : The password contains at least one lowercase letter (a-z)
      //4 : The password contains at least one uppercase letter (A-Z)
      if (userCommFunc.validatePassword(requestBody.password) === 1) {
        validateMsg += "The password length is at least 8 characters.";
      }
      if (userCommFunc.validatePassword(requestBody.password) === 2)
        validateMsg += "The password contains at least one digit (0-9).";
      if (userCommFunc.validatePassword(requestBody.password) === 3)
        validateMsg +=
          "The password contains at least one lowercase letter (a-z).";
      if (userCommFunc.validatePassword(requestBody.password) === 4)
        validateMsg +=
          "The password contains at least one uppercase letter (A-Z).";
    }
    //end validate
    let sqlCheckEmail = `SELECT * FROM users WHERE email = '${requestBody.email}'`;
    let sqlCheckfNamelName = `SELECT * FROM users WHERE firstname = '${requestBody.firstName}' and lastname = '${requestBody.lastName}'`;

    connectionStr.connection.execute(sqlCheckEmail, (err, userCheckEmail) => {
      //เช็ค email ซ้ำ
      if (err) {
        var errors = responses.error;
        errors.message = err.message;
        callBack(errors);
      }
      if (userCheckEmail.length > 0) {
        validateMsg += "Email have already exits.";
      }
      connectionStr.connection.execute(
        sqlCheckfNamelName,
        (err, userCheckName) => {
          if (err) {
            var errors = responses.error;
            errors.message = err.message;
            res.send(errors);
          }
          if (userCheckName.length > 0) {
            validateMsg +=
              "Your firstname name and lastname have already exits.";
          }

          if (validateMsg != "") {
            var errorsValidate = responses.badRequest;
            errorsValidate.message = validateMsg;
            callBack(errorsValidate);
          }

          //generate username
          requestBody.userName = userCommFunc.genUserName(
            requestBody.firstName,
            requestBody.lastName
          );
          //generate new guid
          requestBody.Id = guidCaller.generateGuid();

          //hash password and insert to table
          bcrypt.hash(requestBody.password, saltRounds, function (err, hash) {
            var sqlSave = "";
            if (id == "") {
              ///insert
              sqlSave = `INSERT INTO users (ID,Email,Password,FirstName,LastName,UserName,PhoneNumber,BirthDate,IsActive,CreatedBy,CreatedDate,UpdatedBy,UpdatedDate) values
              ('${requestBody.Id}','${requestBody.email}','${hash}','${requestBody.firstName}','${requestBody.lastName}', '${requestBody.userName}', '${requestBody.phoneNumber}','${requestBody.birthDate}','${requestBody.isActive}','${requestBody.createdBy}','${requestBody.createdDate}','${requestBody.updatedBy}','${requestBody.updatedDate}')
              `;
            } else {
              //update
              sqlSave = `UPDATE  users SET 
              Email='${requestBody.email}',
              Password='${hash}',
              FirstName='${requestBody.firstName}',
              LastName='${requestBody.lastName}',
              UserName='${requestBody.userName}',
              PhoneNumber='${requestBody.phoneNumber}',
              BirthDate='${requestBody.birthDate}',
              IsActive='${requestBody.isActive}',
              CreatedBy='${requestBody.createdBy}',
              CreatedDate='${requestBody.createdDate}',
              UpdatedBy='${requestBody.updatedBy}',
              UpdatedDate = '${requestBody.updatedDate}'
              WHERE ID = '${id}'`;
            }
            connectionStr.connection.execute(sqlSave, (err, results) => {
              if (err) {
                callBack({ status: "error", data: [], message: err });
              }
              callBack({
                ...responses.success,
                data: requestBody,
              });
            });
          });
        }
      );
    });
  } catch (err) {
    var errors = responses.error;
    errors.message = err.message;
    callBack(errors);
  }
};
//#endregion

module.exports = router;
