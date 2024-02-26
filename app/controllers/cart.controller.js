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
  try {
    const newCart = await prisma.cart.create({
      data: req.body,
    });
    res.status(201).json(newCart);
  } catch (error) {
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
