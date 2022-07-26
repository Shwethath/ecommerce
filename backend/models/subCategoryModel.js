import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: Number,
  subCategories: [{ name: String, order: Number }],
});
const Category = mongoose.model('Category', categorySchema);
export default Category;
