const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createUser = async (req, res) => {
  try {
    const { name, phoneNumber, city, address, state } = req.body;
    const newUser = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        city,
        address,
        state,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { name, phoneNumber, city, address, state, admin, verified } =
      req.body;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        city,
        address,
        state,
        admin,
        verified,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  const query = req.params.id;

  console.log("query", query, req.params);
  try {
    const users = await prisma.user.findMany();

    const searchResults = users.filter((user) => {
      console.log("user", user);
      if (
        user.name.toString().toLowerCase().includes(query.toLowerCase()) ||
        user.city.toString().toLowerCase().includes(query.toLowerCase()) ||
        user.address?.toString().toLowerCase().includes(query.toLowerCase()) ||
        user.phoneNumber?.toString().toLowerCase().includes(query.toLowerCase())
      ) {
        return user;
      }
    });
    console.log("users", searchResults);
    res.status(200).json(searchResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
