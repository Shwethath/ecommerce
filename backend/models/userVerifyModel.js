import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userVerifyModel = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, exprires: 3600 },
});

const userVerify = mongoose.model('token', userVerifyModel);
export default userVerify;
