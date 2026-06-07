import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB instance safely: ${conn.connection.host}`);
  } catch (error) {
    console.error(`CRITICAL DATABASE ERROR: ${error.message}`);
    process.exit(1); // Force terminate process with execution failure code
  }
};

export default connectDB;