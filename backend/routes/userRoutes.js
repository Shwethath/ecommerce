import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import {
  isAuth,
  isAdmin,
  isSeller,
  generateToken,
  isSellerOrAdmin,
} from '../utils.js';
//import mongoose from 'mongoose';
const userRouter = express.Router();

userRouter.get(
  '/top-sellers',
  expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true })
      .sort({ 'seller.rating': -1 })
      .limit(5);
    res.send(topSellers);
  })
);
//all user api
userRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

const PAGE_SIZE = 4;

userRouter.get(
  '/admin',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    // const sellerFilter = query.sellerMode ? {  req.user._id } : {};

    const users = await User.find({})
      // .populate('seller', 'seller.name seller.logo')
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countUsers = await User.countDocuments({});
    res.send({
      users,
      countUsers,
      page,
      pages: Math.ceil(countUsers / pageSize),
    });
  })
);
//update profile
userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (user.isSeller) {
        user.seller.name = req.body.sellerName || user.seller.name;
        user.seller.logo = req.body.sellerLogo || user.seller.logo;
        user.seller.description =
          req.body.sellerDescription || user.seller.description;
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(updatedUser),
      });
    }
  })
);
//user id api
userRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.get(
  '/sellers/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user && user.isSeller) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        seller: user.seller,
      });
    } else {
      res.status(404).send({ message: 'Seller Not Found' });
    }
  })
);

//user update api
userRouter.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      user.isSeller = Boolean(req.body.isSeller);
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

//user delete
userRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@example.com') {
        res.status(404).send({ message: 'You can not delete admin user' });
        return;
      }
      await user.remove();
      res.send({ message: 'User deleted' });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);
//login api

userRouter.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSeller: user.isSeller,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

//signup api
userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save(); // save to database and return to frontend
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      token: generateToken(user),
    });
  })
);

export default userRouter;

// userRouter.get(
//   '/top-sellers',
//   expressAsyncHandler(async (req, res) => {
//     const topSellers = await User.find({ isSeller: true })
//       .sort({ 'seller.rating': -1 })
//       .limit(3);
//     res.send(topSellers);
//   })
// );

// userRouter.get(
//   '/seed',
//   expressAsyncHandler(async (req, res) => {
//     // await User.remove({});
//     const createdUsers = await User.insertMany(data.users);
//     res.send({ createdUsers });
//   })
// );

// //login api

// userRouter.post(
//   '/login',
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       if (bcrypt.compareSync(req.body.password, user.password)) {
//         res.send({
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           isAdmin: user.isAdmin,
//           isSeller: user.isSeller,
//           token: generateToken(user),
//         });
//         return;
//       }
//     }
//     res.status(401).send({ message: 'Invalid email or password' });
//   })
// );

// //signup api
// userRouter.post(
//   '/register',
//   expressAsyncHandler(async (req, res) => {
//     const newUser = new User({
//       name: req.body.name,
//       email: req.body.email,
//       password: bcrypt.hashSync(req.body.password),
//     });
//     const createdUser = await newUser.save(); // save to database and return to frontend
//     res.send({
//       _id: createdUser._id,
//       name: createdUser.name,
//       email: createdUser.email,
//       isAdmin: createdUser.isAdmin,
//       isSeller: createdUser.isSeller,
//       token: generateToken(createdUser),
//     });
//   })
// );

// //seller id api

// userRouter.get(
//   '/sellers/:id',
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (user && user.isSeller) {
//       res.send({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         seller: user.seller,
//       });
//     } else {
//       res.status(404).send({ message: 'Seller Not Found' });
//     }
//   })
// );

// //user id api
// userRouter.get(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       res.send(user);
//     } else {
//       res.status(404).send({ message: 'User Not Found' });
//     }
//   })
// );

// //update profile
// userRouter.put(
//   '/profile',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.user._id);
// if (user) {
//   user.name = req.body.name || user.name;
//   user.email = req.body.email || user.email;
//   if (user.isSeller) {
//     user.seller.name = req.body.sellerName || user.seller.name;
//     user.seller.logo = req.body.sellerLogo || user.seller.logo;
//     user.seller.description =
//       req.body.sellerDescription || user.seller.description;
//   }
//       if (req.body.password) {
//         user.password = bcrypt.hashSync(req.body.password, 8);
//       }
//       const updatedUser = await user.save();
//       res.send({
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         isAdmin: updatedUser.isAdmin,
//         isSeller: updatedUser.isSeller,
//         token: generateToken(updatedUser),
//       });
//     } else {
//       res.status(404).send({ message: 'User not found' });
//     }
//   })
// );

// userRouter.get(
//   '/',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const users = await User.find({});
//     res.send(users);
//   })
// );

// //user delete
// userRouter.delete(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       if (user.email === 'admin@example.com') {
//         res.status(400).send({ message: 'Can Not Delete Admin User' });
//         return;
//       }
//       const deleteUser = await user.remove();
//       res.send({ message: 'User Deleted', user: deleteUser });
//     } else {
//       res.status(404).send({ message: 'User Not Found' });
//     }
//   })
// );

// //user update api
// userRouter.put(
//   '/:id',
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       user.name = req.body.name || user.name;
//       user.email = req.body.email || user.email;
//       user.isSeller = Boolean(req.body.isSeller);
//       user.isAdmin = Boolean(req.body.isAdmin);
//       const updatedUser = await user.save();
//       res.send({ message: 'User Updated', user: updatedUser });
//     } else {
//       res.status(404).send({ message: 'User Not Found' });
//     }
//   })
// );
// export default userRouter;
