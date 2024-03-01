const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getCarts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const carts = await prisma.cart.findMany({
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });
    const totalCarts = await prisma.cart.count();
    const totalPages = Math.ceil(totalCarts / limit);

    res.status(200).json({
      carts,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCart = async (req, res) => {
  let obj = {
    userDetails: {},
    cartTotal: 0,
    products: [],
    cartStatus: "",
    createdAt: new Date(),
    updatedAt: null,
  };

  if (Object.keys(req.body.userDetails).length == 0) {
    res.status(401).json({ message: "Please add user details" });
    return;
  }

  if (req.body.products.length == 0) {
    res.status(404).json({ message: "Please add products to cart" });
    return;
  }

  obj.cartStatus = "inProgress";
  obj.createdAt = new Date();

  obj = { ...obj, ...req.body };

  console.log("cart obj body", obj, new Date());

  try {
    const newCart = await prisma.cart.create({
      data: obj,
    });
    res.status(201).json(newCart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateCart = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCart = await prisma.cart.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCart = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cart.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
