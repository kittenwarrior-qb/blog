import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_LOCATION, { autoIndex: true });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
};

export default connectDB;
