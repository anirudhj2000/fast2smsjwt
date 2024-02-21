const config = require("../config/auth.config");
const { PrismaClient } = require("@prisma/client");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
let fetch = import("node-fetch");

// async function loadApp() {
//   const fetch = import("node-fetch");
// }
// loadApp();

const prisma = new PrismaClient();

function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // Generates a random number between  0 and  9
  }
  return otp;
}

exports.signup = (req, res) => {
  // Save User to Database
  let obj = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    city: req.body.city,
  };

  prisma.user
    .create({
      data: obj,
    })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console("err", errr);
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  prisma.user
    .findFirst({
      where: { phoneNumber: req.body.phoneNumber },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 400, // 24 hours
      });

      res.status(200).header("Authorization", `Bearer ${token}`).send({
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({ message: err.message });
    });
};

exports.sendOtp = (phoneNumber) => {
  const URL = "https://www.fast2sms.com/dev/bulkV2";
  const body = {
    variables_values: generateOTP(),
    route: "otp",
    numbers: phoneNumber,
  };
  new Promise((resolve, reject) => {
    fetch(URL, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        authorization: env("FAST_2_API_KEY"),
      },
    })
      .then((response) => response.json())
      .then((json) => {
        resolve();
      })
      .catch((err) => {
        console.error(err);
        reject();
      });
  });
};
