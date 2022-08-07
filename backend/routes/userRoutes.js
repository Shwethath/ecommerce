import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Token from '../models/tokenModel.js';
import { isAuth, generateToken, isSellerOrAdmin } from '../utils.js';
//import crypto from 'crypto';

//import nodemailer from 'nodemailer';

const userRouter = express.Router();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'shopeeday@gmail.com',
//     pass: 'shopeeday',
//   },
// });
// transporter.verify((error, success) => {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Ready for messages');
//     console.log(success);
//   }
// });

userRouter.get(
  '/top-sellers',
  expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true })
      .sort({ 'seller.rating': -1 })
      .limit(3);
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
        isSeller: updatedUser.isSeller,
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
    try {
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
        } else {
          res.status(401).send({ message: 'Invalid email or password' });
        }
      }
      res.status(401).send({ message: 'User not registered' });
    } catch (err) {
      console.log(err);
    }
  })
);
//nodemailer setup
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'shopeeday@gmail.com',
//     pass: 'password',
//   },
// });

//signup api
userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    // const OTP = generateOTP()
    const user = await newUser.save();
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save();
    const url = `${process.env.BASE_URL}users/${user._id}/verify/${token}`;
    await sendEmail(user.email, 'verify Email', url);
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      // isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      token: generateToken(user),
    });
  })
);
// userRouter.get('/:id/verify/:token/', async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.params.id });
//     if (!user) return res.status(400).send({ message: 'Invalid link' });
//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) return res.status(400).send({ message: 'Invalid link' });
//     await User.updateOne({ _id: user._id, isVerified: true });
//     await token.remove();

//     res.status(200).send({ message: 'Email verified successfully' });
//   } catch (error) {
//     res.status(500).send({ message: 'Internal Server Error' });
//   }
// });
// userRouter.get(
//   '/forgot-password',
//   expressAsyncHandler(async (req, res) => {})
// );

// userRouter.post(
//   '/forgot-password',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findOne({ email: req.body.email });
//     if (email !== user.email) {
//       res.send('User not registered');
//       return;
//     } else {
//       res.send({
//         token: generateToken(user),
//       });
//     }
//   })
// );

// userRouter.get(
//   '/reset-password',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {})
// );

// userRouter.post(
//   '/reset-password',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {})
// );
export default userRouter;

// save to database and return to frontend
// try {
//   transporter.sendMail({
//     to: `${user.email}`,
//     from: 'no-reply@shopeeday.com',
//     subject: 'Login success',
//     html: '<h3>Welcome to shopee Day website</h3>',
//   });
//   console.log('Message sent successfully ');
// } catch (err) {
//   console.log(err);
// }
