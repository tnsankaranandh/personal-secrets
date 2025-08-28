const { UserModel } = require("../../models/User");
const chalk = require("chalk");

const authenticate: any = async (req: any, res: any, next: any) => {
  try {
    const { username, password } = req.body || {};
    let user = await UserModel.findByCredentials(username, password);
    const token = user.generateAuthToken();
    user = user.toObject();
    user.sessionToken = token;
    delete user.password;
    console.log("user object in response ", user);
    res.send({ user });
  } catch (e) {
    console.log(
      'Error while logging in!',
      chalk.red('✗')
    );
    next(e);
  }
};

const create: any = async (req: any, res: any, next: any) => {
  try {
    const newUserObject = new UserModel(req.body);
    await newUserObject.save();
    res.send(newUserObject);
  } catch (e) {
    console.log(
      'Error while creating user!',
      chalk.red('✗')
    );
    next(e);
  }
};

module.exports = {
  authenticate,
  create,
};