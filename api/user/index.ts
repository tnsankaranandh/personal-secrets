import UserModel from "../../models/User";
import * as chalk from "chalk";

const login: any = async (req: any, res: any) => {
  try {
    const { username, password } = req.body || {};
    let user = await UserModel.findByCredentials(username, password);
    const token = user.generateAuthToken();
    user = user.toObject();
    user.sessionToken = token;
    delete user.password;
    res.send({ user });
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while logging in!',
      chalk.red('✗')
    );
    throw (e);
  }
};

const create: any = async (req: any, res: any) => {
  try {
    const newUserObject = new UserModel(req.body);
    await newUserObject.save();
    res.send(newUserObject);
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while creating user!',
      chalk.red('✗')
    );
    throw (e);
  }
};

export {
  login,
  create,
};