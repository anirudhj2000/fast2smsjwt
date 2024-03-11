const config = require("../config/auth.config");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
async function loadApp() {
  const fetch = import("node-fetch");
}
loadApp();

const prisma = new PrismaClient();

function generateOTP(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// Signup controller
exports.signup = (req, res) => {
  let obj = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    city: req.body.city,
  };

  this.sendOtp(req.body.phoneNumber)
    .then(async (phoneData) => {
      let isUser = await prisma.user.findFirst({
        where: { phoneNumber: req.body.phoneNumber },
      });

      if (isUser) {
        res.status(200).send({ message: "User already exists" });
      }

      prisma.user
        .create({
          data: obj,
        })
        .then((user) => {
          res.status(200).send(user);
        })
        .catch((err) => {
          console.log("err", err);
          res.status(403).send({ message: err.message });
        });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({ message: "Internal server error" });
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

      this.sendOtp(req.body.phoneNumber)
        .then((resData) => {
          if (resData.return)
            res.status(200).send({ message: "Verify OTP to continue" });
          else throw resData;
        })
        .catch((err) => {
          console.log("err", err);
          res.status(500).send({ message: "Some error has occurred" });
        });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).send({ message: "Some error has occurred" });
    });
};

exports.sendOtp = (phoneNumber) => {
  const URL = "https://www.fast2sms.com/dev/bulkV2";
  const body = {
    variables_values: generateOTP(),
    route: "otp",
    numbers: phoneNumber,
  };
  console.log("phoine body", body);
  return new Promise((resolve, reject) => {
    fetch(URL, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        authorization: process.env.FAST_2_API_KEY,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.return) {
          prisma.otp
            .create({
              data: {
                otp: body.variables_values,
                phoneNumber: phoneNumber,
                createdAt: new Date(),
              },
            })
            .then(() => {
              resolve(json);
            })
            .catch((err) => {
              console.log("err", err);
              reject();
            });
        } else {
          reject();
        }
      })
      .catch((err) => {
        console.log("err", err);
        console.error(err);
        reject();
      });
  });
};

exports.verifyOtp = (req, res) => {
  prisma.user
    .findUnique({
      where: { phoneNumber: req.body.phoneNumber },
    })
    .then((user) => {
      prisma.otp
        .findFirst({
          where: { phoneNumber: user.phoneNumber },
          orderBy: { createdAt: "desc" },
        })
        .then((resOtp) => {
          if (resOtp.otp == req.body.otp) {
            const token = jwt.sign({ id: user.id }, config.secret, {
              algorithm: "HS256",
              allowInsecureKeySizes: true,
              expiresIn: 86400, // 24 hours
            });

            res.cookie("jwt", token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
            });
            res.status(200).send(user);
          } else {
            res.status(401).send({ message: "Incorrect OTP" });
          }
        })
        .catch((err) => {
          console.log("err", err);
          res.status(401).send({ message: "Error processing request" });
        });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(401).send({ message: "Error processing request" });
    });
};
