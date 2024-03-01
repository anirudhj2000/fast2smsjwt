const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to send email
const sendOrderEmail = (order) => {
  // Email sending logic goes here
  // For demonstration purposes, we'll just log the order details
  console.log(`Sending order email for order ID: ${order.id}`);
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

  console.log("cart obj body", obj, new Date());
  try {
    const newOrder = await prisma.order.create({
      data: obj,
    });

    // // Send email with order details
    // sendOrderEmail(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
