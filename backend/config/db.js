const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("\n❌ MongoDB Connection Error:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes("whitelist")) {
      console.error("\n💡 TIP: If using MongoDB Atlas:");
      console.error("   1. Go to: https://cloud.mongodb.com/");
      console.error("   2. Select your cluster → Network Access");
      console.error("   3. Click 'Add IP Address' → 'Add Current IP Address'");
      console.error("   4. Wait a few minutes for changes to propagate");
      console.error("   5. See MONGODB_SETUP.md for detailed instructions");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("\n💡 TIP: If using local MongoDB:");
      console.error("   1. Make sure MongoDB is running");
      console.error("      Windows: Check Services or run 'mongod'");
      console.error("      Mac/Linux: 'sudo systemctl start mongod' or 'mongod'");
      console.error("   2. Check your MONGO_URI in backend/.env file");
      console.error("   3. Default local URI: mongodb://localhost:27017/storage-platform");
      console.error("   4. See MONGODB_SETUP.md for detailed instructions");
    } else {
      console.error("\n💡 TIP: Check your MONGO_URI in backend/.env file");
      console.error("   See MONGODB_SETUP.md for setup instructions");
    }
    
    console.error("\n⚠️  Fix the connection issue and restart the server.\n");
    process.exit(1);
  }
};

module.exports = connectDB;
