const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');

// GET /products
router.get('/', async (req, res) => {
  try {
    const sort = { _id: -1 };
    const products = await Product.find().sort(sort);
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// POST /products
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images: pictures,
      stocks,
    } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      pictures,
      stocks,
    });
    const products = await Product.find();
    res.status(201).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// PATCH /products/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      description,
      price,
      category,
      images: pictures,
      stocks,
    } = req.body;
    const product = await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      category,
      pictures,
      stocks,
    });
    const products = await Product.find();
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// DELETE /products/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user.isAdmin) return res.status(401).json("You don't have permission");
    await Product.findByIdAndDelete(id);
    const products = await Product.find();
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    const similar = await Product.find({ category: product.category }).limit(5);
    res.status(200).json({ product, similar });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// GET /products/category/:category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    let products;
    const sort = { _id: -1 };
    if (category == 'all') {
      products = await Product.find().sort(sort);
    } else {
      products = await Product.find({ category }).sort(sort);
    }
    res.status(200).json(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// POST /products/add-to-cart
router.post('/add-to-cart', async (req, res) => {
  const { userId, productId, price } = req.body;

  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    if (user.cart[productId]) {
      userCart[productId] += 1;
    } else {
      userCart[productId] = 1;
    }
    userCart.count += 1;
    userCart.total = Number(userCart.total) + Number(price);
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    const product = await Product.findById(productId);
    product.stocks -= 1; // Decrease stocks by 1
    await product.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// POST /products/increase-cart
router.post('/increase-cart', async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total += Number(price);
    userCart.count += 1;
    userCart[productId] += 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    const product = await Product.findById(productId);
    product.stocks -= 1; // Decrease stocks by 1
    await product.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// POST /products/decrease-cart
router.post('/decrease-cart', async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(price);
    userCart.count -= 1;
    userCart[productId] -= 1;
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    const product = await Product.findById(productId);
    product.stocks += 1; // Increase stocks by 1
    await product.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// POST /products/remove-from-cart
router.post('/remove-from-cart', async (req, res) => {
  const { userId, productId, price } = req.body;
  try {
    const user = await User.findById(userId);
    const userCart = user.cart;
    userCart.total -= Number(userCart[productId]) * Number(price);
    userCart.count -= userCart[productId];
    delete userCart[productId];
    user.cart = userCart;
    user.markModified('cart');
    await user.save();
    const product = await Product.findById(productId);
    product.stocks += userCart[productId]; // Increase stocks by the quantity in the cart
    await product.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/search/:key', async (req, res) => {
  try {
    const regex = new RegExp(req.params.key, 'i');
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } },
        { category: { $regex: regex } },
      ],
    });
    res.send(products);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
