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

// Function to send email
const sendOrderEmailCustomer = (order) => {
  let subject =
    "Order:" +
    order.id +
    " - " +
    order.userDetails.name +
    " - " +
    order.userDetails.phoneNumber;

  let tableBody = "";

  for (let i = 0; i < order.products.length; i++) {
    tableBody += `<tr> <td>${order.products[i].productTitle}</td> <td>${order.products[i].quantity}</td> <td>${order.products[i].price}</td> </tr>`;
  }

  const mailOptions = {
    from: '"Mahakali Sarees" <noreply@mahakalisarees.com>',
    to: order.userDetails.email,
    subject: subject,
    html:
      "<div> <h2>Order Confirmation</h2> <p>Dear " +
      order.userDetails.name +
      ",</p> <p>Thank you for your order. Your order details are as follows:</p> <h3>Order Summary</h3> <table> <tr > <th>Product</th> <th>Number of bales</th> <th>Price</th> </tr> " +
      tableBody +
      " </table> <p>Order Date:" +
      new Date(order.orderDate) +
      "/p> <p>Thank you for shopping with us. If you have any questions, please contact us at info@mahakalitextiles.in</p> <p>Best regards,</p> <p>Mahakali Sarees</p> </div>",
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

const sendOrderEmail = (order) => {
  let subject =
    "Order:" +
    order.id +
    " - " +
    order.userDetails.name +
    " - " +
    order.userDetails.phoneNumber;

  let tableBody = "";

  for (let i = 0; i < order.products.length; i++) {
    tableBody += `<tr> <td>${order.products[i].productTitle}</td> <td>${order.products[i].quantity}</td> <td>${order.products[i].price}</td> </tr>`;
  }

  const mailOptions = {
    from: '"Mahakali Sarees" <noreply@mahakalisarees.com>',
    to: "notification@mahakalisarees.com",
    subject: subject,
    html:
      "<div> <h2>Order Confirmation</h2> <h3>Order Summary</h3> <table> <tr > <th>Product</th> <th>Number of bales</th> <th>Price</th> </tr> " +
      tableBody +
      " </table> <h3>User Details</h3> <p>City: " +
      order.userDetails.city +
      "</p> <p>Phone Number:" +
      order.userDetails.phoneNumber +
      " <p>Order Date:" +
      new Date(order.orderDate) +
      "</p> <p>Best regards,</p> <p>Mahakali Sarees</p> </div>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
      console.log("customer email sent");
    }
  });
};

exports.createOrder = async (req, res) => {
  let obj = {
    userDetails: {},
    totalAmount: 0,
    products: [],
    orderDate: new Date(),
  };

  console.log("orders reached here", req.body);

  if (Object.keys(req.body.userDetails).length == 0) {
    res.status(401).json({ message: "Please add user details" });
    return;
  }

  if (req.body.cartId == "") {
    res.status(404).json({ message: "Please use valid cart information" });
    return;
  }

  if (req.body.products.length == 0) {
    res.status(404).json({ message: "Please add products to cart" });
    return;
  }

  obj = { ...obj, ...req.body };
  try {
    const newOrder = await prisma.order.create({
      data: obj,
    });

    // // Send email with order details

    sendOrderEmail(newOrder);

    if (newOrder.userDetails.email) sendOrderEmailCustomer(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let items = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * items;

    const orders = await prisma.order.findMany({
      skip: skip,
      take: items,
      orderBy: {
        orderDate: "desc",
      },
    });

    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / items);

    res.status(200).json({
      orders,
      totalOrders,
      totalPages,
    });
  } catch (error) {
    console.log("error", error);
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.order.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
