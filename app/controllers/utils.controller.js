const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.in",
  port: 587,
  auth: {
    user: "emailapikey",
    pass: process.env.EMAIL_API_KEY,
  },
});

exports.createContact = async (req, res) => {
  try {
    const { name, email, phoneNumber, message } = req.body;
    prisma.contact
      .create({
        data: {
          name,
          email,
          phoneNumber,
          message,
        },
      })
      .then((data) => {
        sendMailContactUs(data);
        res.status(201).json(data);
      })
      .catch((error) => {
        res.status(403).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMailContactUs = (contactData) => {
  let subject = "Contact Us Request " + contactData.name;

  let body =
    "<div><h1>Contact Us Request</h1><div>" +
    "<div>" +
    "<span style='font-weight:bold'>Name : </span>" +
    "<span>" +
    `${contactData.name}` +
    "</span>" +
    "</div>" +
    "<div>" +
    "<span style='font-weight:bold'>Phone Number : </span>" +
    "<span>" +
    `${contactData.phoneNumber}` +
    "</span>" +
    "</div>" +
    "<div>" +
    "<span style='font-weight:bold'>Email : </span>" +
    "<span>" +
    `${contactData.email}` +
    "</span>" +
    "</div>" +
    "<div style='display:flex;flex-direction:column;'>" +
    "<span style='font-weight:bold'>Message : </span>" +
    "<span>" +
    `${contactData.message}` +
    "</span>" +
    "</div>" +
    "</div>" +
    "</div>";

  const mailOptions = {
    from: '"Mahakali Sarees" <noreply@mahakalisarees.com>',
    to: "contact@mahakalisarees.com",
    subject: subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
      console.log("admin email sent");
    }
  });
};
