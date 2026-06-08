import mongoose from 'mongoose';

const AdminConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AdminConfig = mongoose.model('AdminConfig', AdminConfigSchema);

export default AdminConfig;
