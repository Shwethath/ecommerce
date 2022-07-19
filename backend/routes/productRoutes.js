import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, isSeller, isSellerOrAdmin } from '../utils.js';

const productRouter = express.Router();

productRouter.get(
  '/top-products',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.find()
      .populate('seller', 'seller.name seller.logo')
      .sort({ rating: -1 })
      .limit(4);
    res.send(product);
  })
);
/*products api*/
productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const sellerFilter = req.query.sellerMode ? { seller: req.user._id } : {};
    const products = await Product.find({ ...sellerFilter }).populate(
      'seller',
      'seller.name seller.logo'
    );
    res.send(products);
  })
);

productRouter.post(
  '/',
  isAuth,
  // isAdmin,
  // isSeller,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: 'sample name' + Date.now(),
      seller: req.user._id,
      slug: 'sample-name-' + Date.now(),
      image: '/images/productspic/cloth1.jpg',
      price: 0,
      category: 'cloths',
      brand: 'sample brand',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'Sample description',
    });
    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
  })
);
//sellerpage
productRouter.get(
  '/sellers/:id',
  expressAsyncHandler(async ({ params }, res) => {
    const products = await Product.find({ seller: params.id }).populate(
      'seller',
      'seller.name seller.logo seller.rating seller.numReviews'
    );
    res.send(products);
  })
);
const PAGE_SIZE = 4;

productRouter.get(
  '/admin',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query, user } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const sellerFilter = query.sellerMode ? { seller: user._id } : {};

    const products = await Product.find({
      ...sellerFilter,
    })
      .populate('seller', 'seller.name seller.logo')
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments({ ...sellerFilter });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);
//product id updation api
productRouter.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      // product.seller = req.body.seller;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      const updatedProduct = await product.save();
      res.send({ message: 'Product Updated', product: updatedProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// product delete api
productRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const deleteProduct = await product.remove();
      res.send({ message: 'Product deleted', product: deleteProduct });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

/* Reviews */
productRouter.post(
  '/:id/reviews',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'You already submitted a review' });
      }
      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((a, c) => c.rating + a, 0);
      product.reviews.length;

      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

/*products list api*/

/*products search api*/
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const brand = query.brand || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const brandFilter = brand && brand !== 'all' ? { brand } : {};

    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...brandFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .populate('seller', 'seller.name seller.logo')
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

//Product Categories api
productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

//indivdual products

// productRouter.get('/slug/:slug', async (req, res) => {
//   const product = await Product.findOne({ slug: req.params.slug });
//   if (product) {
//     res.send(product);
//   } else {
//     res.status(404).send({ message: 'Product Not Found' });
//   }
// });
productRouter.get(
  '/slug/:slug',
  expressAsyncHandler(async ({ params }, res) => {
    const product = await Product.findOne({ slug: params.slug }).populate(
      'seller',
      'seller.name seller.logo seller.rating seller.numReviews'
    );
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

//products id api
productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'seller.name seller.logo seller.rating seller.numReviews'
    );
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);
export default productRouter;

//admin api

/*

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    // const sellerFilter = query.sellerMode ? { seller: user._id } : {};

    const products = await Product.find({})
      // .populate('seller', 'seller.name seller.logo')
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments({});
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      await product.save();
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);
*/

// productRouter.get(
//   '/top-products',
//   expressAsyncHandler(async (req, res) => {
//     const products = await Product.find()
//       .populate('seller', 'seller.name seller.logo')
//       .sort({ rating: -1 })
//       .limit(4);
//     res.send(products);
//   })
// );

// productRouter.get(
//   '/sellers/:id',
//   expressAsyncHandler(async ({ params }, res) => {
//     const products = await Product.find({ seller: params.id }).populate(
//       'seller',
//       'seller.name seller.logo seller.rating seller.numReviews'
//     );
//     res.send(products);
//   })
// );

// const PAGE_SIZE = 3;
// productRouter.get(
//   '/',
//   expressAsyncHandler(async ({ query }, res) => {
//     const pageSize = query.pageSize || PAGE_SIZE;
//     const page = query.page || 1;
//     const category = query.category || '';
//     const brand = query.brand || '';
//     const price = query.price || '';
//     const rating = query.rating || '';
//     const order = query.order || '';
//     const searchQuery = query.query || '';

//     const queryFilter =
//       searchQuery && searchQuery !== 'all'
//         ? {
//             name: {
//               $regex: searchQuery,
//               $options: 'i',
//             },
//           }
//         : {};
//     const categoryFilter = category && category !== 'all' ? { category } : {};
//     const brandFilter = brand && brand !== 'all' ? { brand } : {};
//     const ratingFilter =
//       rating && rating !== 'all'
//         ? {
//             rating: {
//               $gte: Number(rating),
//             },
//           }
//         : {};
//     const priceFilter =
//       price && price !== 'all'
//         ? {
//             price: {
//               $gte: Number(price.split('-')[0]),
//               $lte: Number(price.split('-')[1]),
//             },
//           }
//         : {};

//     const sortOrder =
//       order === 'featured'
//         ? { featured: -1 }
//         : order === 'lowest'
//         ? { price: 1 }
//         : order === 'highest'
//         ? { price: -1 }
//         : order === 'toprated'
//         ? { rating: -1 }
//         : order === 'newest'
//         ? { createdAt: -1 }
//         : { _id: -1 };

//     const products = await Product.find({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...brandFilter,
//       ...ratingFilter,
//     })
//       .populate('seller', 'seller.name seller.logo')
//       .sort(sortOrder)
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);

//     const countProducts = await Product.countDocuments({
//       ...queryFilter,
//       ...categoryFilter,
//       ...priceFilter,
//       ...brandFilter,
//       ...ratingFilter,
//     });
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

// //admin api
// productRouter.get(
//   '/admin',
//   isAuth,
//   isSellerOrAdmin,
//   expressAsyncHandler(async ({ query, user }, res) => {
//     const pageSize = query.pageSize || PAGE_SIZE;
//     const page = query.page || 1;

//     const sellerFilter = query.sellerMode ? { seller: user._id } : {};

//     const products = await Product.find({
//       ...sellerFilter,
//     })
//       .populate('seller', 'seller.name seller.logo')
//       .skip(pageSize * (page - 1))
//       .limit(pageSize);

//     const countProducts = await Product.countDocuments({
//       ...sellerFilter,
//     });
//     res.send({
//       products,
//       countProducts,
//       page,
//       pages: Math.ceil(countProducts / pageSize),
//     });
//   })
// );

// //product categories

// productRouter.get(
//   '/categories',
//   expressAsyncHandler(async (req, res) => {
//     const categories = await Product.find().distinct('category');
//     res.send(categories);
//   })
// );

// //product id
// productRouter.get(
//   '/:id',
//   expressAsyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id).populate(
//       'seller',
//       'seller.name seller.logo seller.rating seller.numReviews'
//     );
//     if (product) {
//       res.send(product);
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// productRouter.post(
//   '/',
//   isAuth,
//   isSellerOrAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const newProduct = new Product({
//       name: 'sample name' + Date.now(),
//       slug: 'sample-name-' + Date.now(),
//       seller: req.user._id,
//       image: '/images/productspic/cloth1.jpg',
//       price: 0,
//       category: 'sample category',
//       size: 'XL',
//       brand: 'sample brand',
//       countInStock: 0,
//       rating: 0,
//       numReviews: 0,
//       description: 'Sample description',
//     });
//     const createdProduct = await newProduct.save();
//     res.send({ message: 'Product Created', product: createdProduct });
//   })
// );

// //product id updation api
// productRouter.put(
//   '/:id',
//   isAuth,
//   isSellerOrAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (product) {
//       product.name = req.body.name;
//       product.slug = req.body.slug;
//       product.price = req.body.price;
//       product.image = req.body.image;
//       product.images = req.body.images;
//       product.category = req.body.category;
//       product.size = req.body.size;
//       product.countInStock = req.body.countInStock;
//       product.description = req.body.description;
//       const updatedProduct = await product.save();
//       res.send({ message: 'Product Updated', product: updatedProduct });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// productRouter.delete(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       const deleteProduct = await product.remove();
//       res.send({ message: 'Product Deleted', product: deleteProduct });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// /*products api*/
// productRouter.get(
//   '/',
//   isSellerOrAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const seller = req.query.seller || '';
//     const sellerFilter = seller ? { seller } : {};
//     const products = await Product.find({ ...sellerFilter }).populate(
//       'seller',
//       'seller.name seller.logo'
//     );
//     res.send(products);
//   })
// );

// // product delete api
// productRouter.delete(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (product) {
//       await product.remove();
//       res.send({ message: 'Product deleted' });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );
// /* Reviews */
// productRouter.post(
//   '/:id/reviews',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const productId = req.params.id;
//     const product = await Product.findById(productId);
//     if (product) {
//       if (product.reviews.find((x) => x.name === req.user.name)) {
//         return res
//           .status(400)
//           .send({ message: 'You already submitted a review' });
//       }
//       const review = {
//         name: req.user.name,
//         rating: Number(req.body.rating),
//         comment: req.body.comment,
//       };
//       product.reviews.push(review);
//       product.numReviews = product.reviews.length;
//       product.rating = product.reviews.reduce((a, c) => c.rating + a, 0);
//       product.reviews.length;

//       const updatedProduct = await product.save();
//       res.status(201).send({
//         message: 'Review created',
//         review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
//         numReviews: product.numReviews,
//         rating: product.rating,
//       });
//     } else {
//       res.status(404).send({ message: 'Product Not Found' });
//     }
//   })
// );

// export default productRouter;
