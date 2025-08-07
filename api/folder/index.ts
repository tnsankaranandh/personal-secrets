import FolderModel from "../../models/Folder";
import * as chalk from "chalk";

const list: any = async (req: any, res: any) => {
  console.log("in folders api list function");
  try {
    let folders = await FolderModel.find({});
    console.log('folders: ', folders);
    res.send({ folders });
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while listing folders!',
      chalk.red('✗')
    );
    throw (e);
  }
};

const create: any = async (req: any, res: any) => {
  try {
    console.log(req.body);
    const newFolderObject = new FolderModel({
      name: req.body.name,
    });
    await newFolderObject.save();
    console.log(newFolderObject);
    res.send(newFolderObject);
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while creating folder!',
      chalk.red('✗')
    );
    throw (e);
  }
};

export {
  list,
  create
};