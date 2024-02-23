const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.searchProducts = async (req, res) => {
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  exports.searchProducts = async (req, res) => {
    try {
      const { query, minPrice, maxPrice, minRating, maxRating, minDiscount } =
        req.body;
      const { page = 1, limit = 10 } = req.query;
      const whereClause = {
        name: {
          contains: query,
          mode: "insensitive",
        },
      };

      // Range-based filters
      if (minPrice && maxPrice) {
        whereClause.price = {
          gte: parseFloat(minPrice),
          lte: parseFloat(maxPrice),
        };
      }

      //   if (minRating && maxRating) {
      //     whereClause.rating = {
      //       gte: parseFloat(minRating),
      //       lte: parseFloat(maxRating),
      //     };
      //   }

      if (minDiscount) {
        whereClause.discountedAmount = {
          gt: parseFloat(minDiscount),
        };
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Fetch products with pagination and filters
      const products = await prisma.product.findMany({
        where: whereClause,
        skip: skip,
        take: parseInt(limit),
      });

      // Total number of products matching the filters (for pagination purposes)
      const totalProducts = await prisma.product.count({
        where: whereClause,
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalProducts / limit);

      // Send response with products and pagination info
      res.status(200).json({
        products,
        totalPages,
        currentPage: parseInt(page),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await prisma.product.create({
      data: req.body,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
