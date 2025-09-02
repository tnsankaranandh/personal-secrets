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

const detail: any = async (req: any, res: any, next: any) => {
  console.log("in user api list function");
  try {
    const { userUid } = req.params;
    let user = await UserModel.findById(userUid);
    res.send({ user });
  } catch (e) {
    console.log(
      'Error while getting user detail!',
      chalk.red('✗')
    );
    next(e);
  }
};

const update: any = async (req: any, res: any, next: any) => {
  try {
    console.log(req.body);
    const updatedUser = await UserModel.findByIdAndUpdate(req.body._id, {
      emailid: req.body.emailid,
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    }, {
      new: true
    });
    console.log(updatedUser);
    res.send(updatedUser);
  } catch (e) {
    console.log(
      'Error while updating user!',
      chalk.red('✗')
    );
    next(e);
  }
};

module.exports = {
  authenticate,
  create,
  detail,
  update,
};