const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "anirudhjoshi485@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send email
const sendOrderEmail = (order) => {
  // 2 Emails :  1 for customer , 1 for order
  let subject =
    "Order:" +
    order.id +
    " - " +
    order.userDetails.name +
    " - " +
    order.userDetails.phoneNumber;

  const mailOptions = {
    from: "anirudhjoshi485@gmail.com",
    to: "theinfinitysolutions9@gmail.com",
    subject: subject,
    html: "<div> <h2>Order Confirmation</h2> <p>Dear Anirudh,</p> <p>Thank you for your order. Your order details are as follows:</p> <h3>Order Summary</h3> <table> <tr > <th>Product</th> <th>Quantity</th> <th>Price</th> </tr> <!-- Products will be inserted here --> </table> <h3>User Details</h3> <p>City: Hyderabad</p> <p>Phone Number: 9398542806</p> <h3>Order Total</h3> <p>Total Amount: ₹2000</p> <p>Order Date: 2024-03-12</p> <p>Thank you for shopping with us. If you have any questions, please contact us at support@example.com.</p> <p>Best regards,</p> <p>Your Company Name</p> </div>",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
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

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let items = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * items;

    // console.log("req", req);

    const orders = await prisma.order.findMany({
      skip: skip,
      take: items,
      orderBy: {
        orderDate: "desc", // Order by date in descending order
      },
    });

    // Optionally, you can also fetch the total count of orders for pagination purposes
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
