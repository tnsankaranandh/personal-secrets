const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB: Function = async () => {
  try {
    // MongoDB setup.
    // mongoose.set('useFindAndModify', false);
    // mongoose.set('useCreateIndex', true);
    // mongoose.set('useNewUrlParser', true);
    // mongoose.set('useUnifiedTopology', true);
    console.log("process.env");
    console.log(process.env);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongoose connected");
  } catch (e) {
    console.error(e.message);
    console.log(
      '%s MongoDB connection error. Please make sure MongoDB is running.',
      chalk.red('✗')
    );
    throw (e);
  }
};

module.exports = connectDB;