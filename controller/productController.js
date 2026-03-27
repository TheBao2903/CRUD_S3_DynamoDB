import Product from "../models/product.js";
import { uploadImage, deleteImage } from "../services/s3Service.js";

export async function index(req, res) {
  try {
    const query = req.query.search || "";
    const products = await Product.search(query);
    res.render("products/index", {
      products,
      query,
      message: req.query.message,
    });
  } catch (error) {
    res.render("products/index", {
      products: [],
      query: "",
      message: "Error loading products",
      error: error.message,
    });
  }
}

export function create(req, res) {
  res.render("products/form", { product: null, message: null });
}

export async function store(req, res) {
  try {
    const { name, price, unit_in_stock } = req.body;

    if (!name || !price || !unit_in_stock) {
      return res.render("products/form", {
        product: null,
        message: "All fields are required",
      });
    }

    let url_image = null;
    if (req.file) {
      url_image = await uploadImage(req.file);
    }

    await Product.create({
      name,
      price: parseFloat(price),
      unit_in_stock: parseInt(unit_in_stock),
      url_image,
    });

    res.redirect("/?message=Product created successfully");
  } catch (error) {
    res.render("products/form", {
      product: null,
      message: "Error creating product: " + error.message,
    });
  }
}

export async function show(req, res) {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.redirect("/?message=Product not found");
    }
    res.render("products/detail", { product });
  } catch (error) {
    res.redirect("/?message=Error loading product");
  }
}

export async function edit(req, res) {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.redirect("/?message=Product not found");
    }
    res.render("products/form", { product, message: null });
  } catch (error) {
    res.redirect("/?message=Error loading product");
  }
}

export async function update(req, res) {
  try {
    const { name, price, unit_in_stock } = req.body;
    const product = await Product.getById(req.params.id);

    if (!product) {
      return res.redirect("/?message=Product not found");
    }

    if (!name || !price || !unit_in_stock) {
      return res.render("products/form", {
        product,
        message: "All fields are required",
      });
    }

    const updateData = {
      name,
      price: parseFloat(price),
      unit_in_stock: parseInt(unit_in_stock),
    };

    if (req.file) {
      if (product.url_image) {
        await deleteImage(product.url_image);
      }
      updateData.url_image = await uploadImage(req.file);
    }

    await Product.update(req.params.id, updateData);
    res.redirect("/?message=Product updated successfully");
  } catch (error) {
    const product = await Product.getById(req.params.id);
    res.render("products/form", {
      product,
      message: "Error updating product: " + error.message,
    });
  }
}

export async function remove(req, res) {
  try {
    const product = await Product.getById(req.params.id);
    if (product && product.url_image) {
      await deleteImage(product.url_image);
    }
    await Product.delete(req.params.id);
    res.redirect("/?message=Product deleted successfully");
  } catch (error) {
    res.redirect("/?message=Error deleting product");
  }
}
