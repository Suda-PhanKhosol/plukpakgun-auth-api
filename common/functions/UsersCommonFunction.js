const genUserName = (fName, lName) => {
  return fName.trim() + "." + lName.trim().substring(0, 1);
};

const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  //1: The password length is at least 8 characters
  //2 : The password contains at least one digit (0-9)
  //3 : The password contains at least one lowercase letter (a-z)
  //4 : The password contains at least one uppercase letter (A-Z)
  if (password.length < 8) {
    return 1;
  }
  if (!/\d/.test(password)) {
    return 2;
  }
  if (!/[a-z]/.test(password)) {
    return 3;
  }
  if (!/[A-Z]/.test(password)) {
    return 4;
  }
  return true;
}

const validateNumberOnly = (value) => {
  var regex = /^[0-9]+$/;
  return regex.test(value);
};

module.exports = {
  genUserName,
  generateGuid,
  validateEmail,
  validatePassword,
  validateNumberOnly,
};
