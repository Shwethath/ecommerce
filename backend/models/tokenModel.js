import mongoose from "mongoose";

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), exprires: 3600 }, //1 hour
});

const Token = mongoose.model("token", tokenSchema);
export default Token;
