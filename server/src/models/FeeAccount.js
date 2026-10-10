import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number, // integer paise
    required: true,
  },
});

const feeAccountSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
      index: true,
    },
    totalAgreedFee: {
      type: Number, // integer paise
      required: true,
    },
    installments: [installmentSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const FeeAccount = mongoose.model('FeeAccount', feeAccountSchema);
