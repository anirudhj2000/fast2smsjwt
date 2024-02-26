const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to send email
const sendOrderEmail = (order) => {
  // Email sending logic goes here
  // For demonstration purposes, we'll just log the order details
  console.log(`Sending order email for order ID: ${order.id}`);
};

exports.createOrder = async (req, res) => {
  try {
    const newOrder = await prisma.order.create({
      data: req.body,
    });

    // Send email with order details
    sendOrderEmail(newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
