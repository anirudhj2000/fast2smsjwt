const config = require("../config/auth.config");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
async function loadApp() {
  const fetch = import("node-fetch");
}
loadApp();
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.in",
  port: 587,
  auth: {
    user: "emailapikey",
    pass: process.env.EMAIL_API_KEY,
  },
});

function encryptPhoneNumber(phoneNumber) {
  const secretKey = process.env.VERIFY_USER_SECRET;
  const encryptedPhoneNumber = CryptoJS.AES.encrypt(
    phoneNumber,
    secretKey
  ).toString();
  return encryptedPhoneNumber;
}

function decryptPhoneNumber(encryptedPhoneNumber) {
  const secretKey = process.env.VERIFY_USER_SECRET;
  const bytes = CryptoJS.AES.decrypt(encryptedPhoneNumber, secretKey);
  const decryptedPhoneNumber = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedPhoneNumber;
}

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
    email: req.body.email,
  };

  let encryptedString = encryptPhoneNumber(req.body.phoneNumber)
    .toString()
    .replaceAll("+", "xMl399Jk")
    .replaceAll("/", "Por19Ld")
    .replaceAll("=", "Ml11");

  const hostUrl = req.protocol + "://" + req.get("host");
  const verificationURL = `${hostUrl}/api/auth/verifyUser/${encryptedString}`;
  console.log("hostUrl", hostUrl);

  try {
    prisma.user
      .create({
        data: obj,
      })
      .then((user) => {
        if (obj.email) {
          verifyUserByMail(verificationURL, obj)
            .then(() => {
              console.log("email sent");
              res.status(200).send({
                message:
                  "User created successfully, Account Sent for verification",
              });
            })
            .catch((err) => {
              console.log("err", err);
              res.status(403).send({
                message: "Error while creating user, Please try again later",
              });
              prisma.user
                .delete({
                  where: { id: user.id },
                })
                .catch((err) => {
                  console.log("err", err);
                });
            });
        }
      })
      .catch((err) => {
        console.log("err", err);
        res.status(403).send({ message: err.message });
      });
  } catch (err) {
    console.log("err", err);
    res.status(403).send({ message: err.message });
  }
};

exports.signin = (req, res) => {
  prisma.user
    .findFirst({
      where: { phoneNumber: req.body.phoneNumber },
    })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "User not found, Please signup" });
      }

      if (!user.verified) {
        return res
          .status(404)
          .send({ message: "Please verify account to continue" });
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
          console.log("jason", json);
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

exports.verifyUser = (req, res) => {
  const { id } = req.params;
  let encryptedString = id
    .toString()
    .replaceAll("xMl399Jk", "+")
    .replaceAll("Por19Ld", "/")
    .replaceAll("Ml11", "=");

  const hostUrl = req.protocol + "://" + req.get("host");

  try {
    verifyUserPhoneNumber(encryptedString)
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }

        if (user) {
          console.log("userdata verify", user);
          prisma.user
            .update({
              where: { phoneNumber: user.phoneNumber },
              data: { verified: true },
            })
            .then((updatedUser) => {
              if (updatedUser.email) {
                console.log("email check", updatedUser.email);
                confirmVerificationEmail(updatedUser.email);
              }

              // if (updatedUser.phoneNumber) {
              //   console.log("phone check", updatedUser.email);
              //   confirmVerificationPhone(updatedUser.phoneNumber);
              // }

              res.status(200).send(`
                <html>
                  <body>
                    <h1>Verification Successful !!</h1>
                    <p>Your Account has been successfully verified.</p>
                    <a href="${"http://www.mahakalisarees.com"}">Back to Login</a>
                  </body>
                </html>
            `);
            })
            .catch((err) => {
              console.log("err", err);
              res.status(500).send({ message: "Internal server error" });
            });
        }
      })
      .catch((err) => {
        console.log("err", err);
        res.status(500).send({ message: "Internal server error" });
      });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

function verifyUserPhoneNumber(encryptedPhoneNumber) {
  const phoneNumber = decryptPhoneNumber(encryptedPhoneNumber);
  console.log("phone", phoneNumber, encryptedPhoneNumber);
  return prisma.user.findFirst({
    where: { phoneNumber: phoneNumber },
  });
}

const verifyUserByMail = (verficaitionURL, user) => {
  let subject = "Account Verification - " + user.name;

  let userObj = { ...user };
  let userHtml = "";

  userHtml += "<div>";
  userHtml += "<h3>User Details Verification</h3>";

  for (const key in userObj) {
    if (Object.hasOwnProperty.call(userObj, key)) {
      userHtml += "<div style='display:flex;flex-direction:row;'>";
      const element = userObj[key];
      userHtml += `<p>${key} : </p>`;
      userHtml += `<p>${element}</p>`;
      userHtml += "</div>";
    }
  }

  userHtml += "</div>";

  console.log("verficaitionURL", verficaitionURL, user);
  const mailOptions = {
    from: '"Mahakali Sarees" <noreply@mahakalisarees.com>',
    to: "verify@mahakalisarees.com",
    subject: subject,
    html:
      "<div> <h2>Account Verification</h2> <p>Dear User,</p> <p>" +
      user.name +
      " has signed up with Mahakali Sarees. Please click on the link below to their your account:</p> <a href=" +
      verficaitionURL +
      ">Verify Account</a> </br>" +
      userHtml +
      "</div>",
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      console.log("email sent", error, info);
      if (error) {
        console.error("Error sending email: ", error);
        reject();
      } else {
        console.log("Email sent: ", info.response);
        resolve();
      }
    });
  });
};

// const confirmVerificationPhone = (phoneNumber) => {
//   const URL = "https://www.fast2sms.com/dev/bulkV2";
//   const body = {
//     message:
//       "Your account has been successfully verified. Please login to Mahakali Sarees with your registed mobile number " +
//       "https://www.mahakalisarees.com",
//     language: "english",
//     route: "q",
//     numbers: phoneNumber,
//   };
//   console.log("phoine body", body);
//   try {
//     fetch(URL, {
//       method: "post",
//       body: JSON.stringify(body),
//       headers: {
//         "Content-Type": "application/json",
//         authorization: process.env.FAST_2_API_KEY,
//       },
//     })
//       .then((response) => response.json())
//       .then((json) => {
//         if (json.return) {
//           console.log("user notified", json);
//         } else {
//           throw json;
//         }
//       })
//       .catch((err) => {
//         console.log("err", err);
//         console.error(err);
//       });
//   } catch (err) {
//     console.log("err", err);
//     console.error(err);
//   }
// };

const confirmVerificationEmail = (email) => {
  const mailOptions = {
    from: '"Mahakali Sarees" <noreply@mahakalisarees.com>',
    to: email,
    subject: "Account Verification",
    html:
      "<div>  <h1>Verification Successful !!</h1>" +
      "<p>Your Account has been successfully verified.</p>" +
      ` <a href="${"https://www.mahakalisarees.com"}">Back to Login</a>` +
      "</div>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    console.log("email sent", error, info);
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

// const verifyUserBySMS = (verficaitionURL, phoneNumber) => {
//   const URL = "https://www.fast2sms.com/dev/bulkV2";
//   const body = {
//     message:
//       " Click to verify - Mahakali Sarees ," +
//       "Account Verification link: " +
//       verficaitionURL,
//     language: "english",
//     route: "q",
//     numbers: phoneNumber,
//   };
//   console.log("phoine body", body);
//   return new Promise((resolve, reject) => {
//     fetch(URL, {
//       method: "post",
//       body: JSON.stringify(body),
//       headers: {
//         "Content-Type": "application/json",
//         authorization: process.env.FAST_2_API_KEY,
//       },
//     })
//       .then((response) => response.json())
//       .then((json) => {
//         if (json.return) {
//           resolve(json);
//         } else {
//           reject(json);
//         }
//       })
//       .catch((err) => {
//         console.log("err", err);
//         console.error(err);
//         reject();
//       });
//   });
// };
