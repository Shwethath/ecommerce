import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export function generateToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      resetToken: user.resetToken,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '50d',
    }
  );
}

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};

export const isVerified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Verified Token' });
  }
};
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};
export const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token' });
  }
};
export const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token' });
  }
};

//otp generate

export const generateOTP = () => {
  let otp = '';
  for (let i = 0; i <= 3; i++) {
    const val = Math.round(Math.random() * 9);
    otp = otp + val;
  }
  return otp;
};

// export const verifyEmail = (user) => {
//   return `<h1>${user.name}Thanks for Registering on our site</h1>
//   <h4>Please verify your mail to login</h4>
//   <a href="http://${req.headers.host}/user/verify-email?token=${user.emailToken}">verify your email</a>`;
// };

// export const sendEmail = async (email, subject, text) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.HOST,
//       service: process.env.SERVICE,
//       port: Number(process.env.EMAIL_PORT),
//       secure: Boolean(process.env.SECURE),
//       auth: {
//         user: process.env.USER,
//         pass: process.env.PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.USER,
//       to: email,
//       subject: subject,
//       text: text,
//     });
//     console.log('email sent successfully');
//   } catch (error) {
//     console.log('email not sent!');
//     console.log(error);
//     return error;
//   }
// userRouter.put(
//   '/reset-password',
//   expressAsyncHandler(async (req, res) => {
//     const user = await User.findById(req.user._id);
//     // const newPassword = req.body.password;
//     const sentToken = req.body.resetToken;
//     User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } }).t
//     if (user) {
//       user.resetToken = undefined;
//       user.expireToken = undefined;
//       if (req.body.password) {
//         user.password = bcrypt.hashSync(req.body.password, 8);
//       }
//     }
//     const updatedUser = user.save();
//     res.send(
//       {
//         _id: updatedUser._id,
//         resetToken: updatedUser.resetToken,
//         expireToken: updatedUser.expireToken,
//         token: generateToken(updatedUser),
//       },
//       'Password updated'
//     );
//   })
//   // .catch((err) => {
//   //   console.log(err);
//   // });
// );
// };

export const mailgun = () =>
  mg({
    apikey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

export const payOrderEmailTemplate = (order) => {
  return `<h1>Thanks for shopping with us in Shopee Day</h1>
  <p>
  Hi ${order.user.name},</p>
  <p>We have finished processing your order.</p>
  <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Product</strong></td>
  <td><strong>Quantity</strong></td>
  <td><strong align="right">Price</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right"> ₹${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Items Price:</td>
  <td align="right"> ₹${order.itemsPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2">Tax Price:</td>
  <td align="right"> ₹${order.taxPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2">Shipping Price:</td>
  <td align="right"> ₹${order.shippingPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Total Price:</strong></td>
  <td align="right"><strong> ₹${order.totalPrice.toFixed(2)}</strong></td>
  </tr>
  <tr>
  <td colspan="2">Payment Method:</td>
  <td align="right">${order.paymentMethod}</td>
  </tr>
  </table>
  <h2>Shipping address</h2>
  <p>
  ${order.shippingAddress.fullName},<br/>
  ${order.shippingAddress.address},<br/>
  ${order.shippingAddress.city},<br/>
  ${order.shippingAddress.country},<br/>
  ${order.shippingAddress.pinCode}<br/>
  </p>
  <hr/>
  <p>
  Thanks for shopping with us.
  </p>`;
};
