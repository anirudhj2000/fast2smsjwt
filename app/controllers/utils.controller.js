const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createContact = async (req, res) => {
  try {
    const { name, email, phoneNumber, message } = req.body;
    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phoneNumber,
        message,
      },
    });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
