import mongoose from 'mongoose';

// User Schema (Roles: Admin, Claim Officer, Policyholder)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide user full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide user email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['Admin', 'Claim Officer', 'Policyholder'],
        message: '{VALUE} is not a valid role'
      },
      default: 'Policyholder',
      required: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
