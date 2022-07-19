import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import User from '../models/userModel.js';
import expressAsyncHandler from 'express-async-handler';

const seedRouter = express.Router();

seedRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    await User.remove({});
    await Product.remove({});

    const createdUsers = await User.insertMany(data.users);
    const seller = await User.findOne({ isSeller: true });
    const products = data.products.map((product) => ({
      ...product,
      seller: seller._id,
    }));
    const createdProducts = await Product.insertMany(products);
    res.send({ createdUsers, createdProducts });
  })
);

export default seedRouter;

// seedRouter.get(
//   '/',
//   expressAsyncHandler(async (req, res) => {
//     await User.remove({});
//     await Product.remove({});

//     const createdUsers = await User.insertMany(data.users);
//     const seller = await User.findOne({ isSeller: true });
//     const products = data.products.map((product) => ({
//       ...product,
//       seller: seller._id,
//     }));
//     const createdProducts = await Product.insertMany(products);
//     res.send({ createdUsers, createdProducts });
//   })
// );
// export default seedRouter;
