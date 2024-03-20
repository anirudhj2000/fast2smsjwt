const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

exports.searchProducts = async (req, res) => {
  console.log("req body", req.body);
  try {
    const {
      query,
      minPrice,
      maxPrice,
      minDiscount,
      category,
      colors,
      fold,
      page = 1,
      limit = 10,
    } = req.body;

    const whereClause = {};

    if (query.length > 0) {
      whereClause.productTitle = {
        contains: query,
        mode: "insensitive",
      };
    }

    // Range-based filters
    if (minPrice && maxPrice) {
      whereClause.price = {
        gte: parseFloat(minPrice),
        lte: parseFloat(maxPrice),
      };
    }

    if (minDiscount) {
      whereClause.discountPercentage = {
        gte: parseFloat(minDiscount),
      };
    }

    if (category) whereClause.category = { has: category };
    if (fold) whereClause.fold = { contains: fold };
    if (colors) whereClause.colors = { has: colors };

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch products with pagination and filters
    const products = await prisma.product.findMany({
      where: whereClause,
      skip: skip,
      take: parseInt(limit),
    });

    console.log("here", whereClause);

    // Total number of products matching the filters (for pagination purposes)
    const totalProducts = await prisma.product.count({
      where: whereClause,
      orderBy: {
        updatedAt: "desc", // Order by date in descending order
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Send response with products and pagination info
    res.status(200).json({
      products,
      totalPages,
      totalProducts,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.createProduct = async (req, res) => {
  let obj = {
    skuId: req.body.skuId,
    productTitle: req.body.productTitle,
    description: req.body.description || null,
    price: req.body.price,
    discountAvailable: req.body.discountAvailable,
    discountedAmount: req.body.discountedAmount || null,
    discountPercentage: req.body.discountPercentage || null,
    quantity: req.body.quantity || null,
    productImages: req.body.productImages,
    category: req.body.category,
    fold: req.body.fold || null,
    blouse: req.body.blouse,
    newProduct: req.body.newProduct || false,
  };
  try {
    const newProduct = await prisma.product.create({
      data: obj,
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
      where: { id: id },
      data: req.body,
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  console.log("res", id, req.params);
  try {
    await prisma.product.delete({
      where: { id: id },
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

exports.imageUpload = async (req, res) => {
  const fileUrls = req.files.map((file) => {
    return `${file.filename}`;
  });
  let obj = {
    images: fileUrls,
  };

  res.status(200).send(obj);
};

exports.deleteImage = async (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "../../", "images", imageName);

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
      return res.status(500).send("Error deleting image");
    }
    res.send("Image deleted successfully");
  });
};
