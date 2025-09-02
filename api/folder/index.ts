const { FolderModel } = require("../../models/Folder");
const chalk = require("chalk");

const list: any = async (req: any, res: any, next: any) => {
  console.log("in folders api list function");
  try {
    let folders = await FolderModel.find({});
    console.log('folders: ', folders);
    res.send({ folders });
  } catch (e) {
    console.log(
      'Error while listing folders!',
      chalk.red('✗')
    );
    next(e);
  }
};

const detail: any = async (req: any, res: any, next: any) => {
  console.log("in folders api list function");
  try {
    const { folderUid } = req.params;
    let folder = await FolderModel.findById(folderUid);
    res.send({ folder });
  } catch (e) {
    console.log(
      'Error while getting folder detail!',
      chalk.red('✗')
    );
    next(e);
  }
};

const create: any = async (req: any, res: any, next: any) => {
  try {
    console.log(req.body);
    const newFolderObject = new FolderModel({
      name: req.body.name,
    });
    await newFolderObject.save();
    console.log(newFolderObject);
    res.send(newFolderObject);
  } catch (e) {
    console.log(
      'Error while creating folder!',
      chalk.red('✗')
    );
    next(e);
  }
};

const update: any = async (req: any, res: any, next: any) => {
  try {
    console.log(req.body);
    const updatedFolder = await FolderModel.findByIdAndUpdate(req.body._id, {
      name: req.body.name,
    }, {
      new: true
    });
    console.log(updatedFolder);
    res.send(updatedFolder);
  } catch (e) {
    console.log(
      'Error while updating folder!',
      chalk.red('✗')
    );
    next(e);
  }
};

module.exports = {
  list,
  detail,
  create,
  update,
};