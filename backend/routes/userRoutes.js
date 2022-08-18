import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Token from '../models/tokenModel.js';
import {
  isAuth,
  generateToken,
  isSellerOrAdmin,
  isVerified,
} from '../utils.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const userRouter = express.Router();

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shopeeday15@gmail.com',
    pass: 'cymzlbxyawujggcj',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

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

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.isVerified == true) {
      next();
    } else {
      res.status(401).send({ message: 'Please check your email to verify' });
    }
  } catch (err) {
    console.log(err);
  }
};

//signup api
userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email }),
      (user) => {
        if (user) {
          res.send({ message: 'User already registerd' });
        }
      };
    const newUser = new User({
      name,
      email,
      password: bcrypt.hashSync(password),
      isVerified: false,
    });
    const user = await newUser.save(); // save to database and return to frontend
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save();
    try {
      var mailOptions = {
        from: 'shopeeday<shopeeday15@gmail.com>',
        to: `${user.name} <${user.email}>`,
        subject: 'shopeeday - verify your email',
        html: `<h3>${user.name}  Thanks for Registering on our site</h3>
        <h4>Please verify your mail to login</h4>
        <a href="http://${req.headers.host}/api/users/${user._id}/verify/${token.token}">Link to verify your email</a>
        <p>Expires within an hour</p>`,
      };
      transport.sendMail(mailOptions, function (error, body) {
        if (error) {
          console.log(error);
        } else {
          console.log('verification email sent ' + body);
        }
      });
    } catch (err) {
      console.log(err);
    }
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      token: generateToken(user),
    });
    //res.redirect('http://localhost:3000/login');
  })
);

userRouter.get('/:id/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: 'Invalid link' });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: 'Invalid link' });
    await User.updateOne({ _id: user._id }, { isVerified: true });

    await token.remove();

    // res.send('Email verified successfully');
    res.redirect('http://localhost:3000/login/verified');
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

userRouter.post(
  '/login',
  //verifyEmail,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            isSeller: user.isSeller,
            token: generateToken(user),
          });
          res.status(200).send({ message: 'success ' });
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
userRouter.get(
  '/forgot-password',
  expressAsyncHandler(async (req, res) => {
    res.redirect('/forgot-password');
  })
);

userRouter.post(
  '/forgot-password',
  expressAsyncHandler(async (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(422).send('User not exist');
      }

      user.resetToken = token;
      user.expireToken = Date.now() + 36000;
      user.save().then(() => {
        var mailOptions = {
          from: 'shopeeday<shopeeday15@gmail.com>',
          to: `${user.name} <${user.email}>`,
          subject: 'shopeeday - Password Reset',
          html: `<h3>${user.name}  You request for password reset.</h3>
              <h4>Please click button to reset password</h4>
              <a href="http://localhost:3000/reset/${token}"><button>Reset</button></a>
             `,
        };
        transport.sendMail(mailOptions, function (error, body) {
          if (error) {
            console.log(error);
          } else {
            console.log('Password reset email sent ' + body);
          }
        });
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          resetToken: user.resetToken,

          token: generateToken(user),
        });
      });
    });
  })
);
userRouter.post(
  '/reset-password',

  expressAsyncHandler(async (req, res) => {
    try {
      const token = req.query.token;
      const tokenData = await User.findOne({ token: token });
      if (tokenData) {
        const password = req.body.password;
        const newPassword = bcrypt.hashSync(password, 8);
        const userData = await User.findByIdAndUpdate(
          { _id: tokenData._id },
          { $set: { password: newPassword, token: '' } },
          { new: true }
        );

        res.send({ message: 'User Password has been reset', user: userData });
        // res.status(200).send({"User Password has been reset"},  data: userData);
      }
    } catch (err) {
      res.status(404).send(err);
    }
  })
);
export default userRouter;
