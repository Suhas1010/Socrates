import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedProject {
  id: string;
  goal: string;
  templateId: string;
  masteryScore: number;
  totalConcepts: number;
  masteredConcepts: number;
  lastUpdated: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarColor?: string;
  pythonMasteredModules: string[];
  savedProjects: ISavedProject[];
  createdAt: Date;
  updatedAt: Date;
}

const SavedProjectSchema = new Schema<ISavedProject>(
  {
    id: { type: String, required: true },
    goal: { type: String, required: true },
    templateId: { type: String, default: "custom" },
    masteryScore: { type: Number, default: 0 },
    totalConcepts: { type: Number, default: 0 },
    masteredConcepts: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    avatarColor: {
      type: String,
      default: "#F59E0B",
    },
    pythonMasteredModules: {
      type: [String],
      default: [],
    },
    savedProjects: {
      type: [SavedProjectSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose OverwriteModelError in Next.js hot-reloading
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
