const { FolderModel } = require("../../models/Folder");
const { ItemModel } = require("../../models/Item");
const chalk = require("chalk");
const mongoose = require("mongoose");

const list: any = async (req: any, res: any, next: any) => {
  try {
    let folders = await FolderModel.find({});
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
    const updatedFolder = await FolderModel.findByIdAndUpdate(req.body._id, {
      name: req.body.name,
    }, {
      new: true
    });
    res.send(updatedFolder);
  } catch (e) {
    console.log(
      'Error while updating folder!',
      chalk.red('✗')
    );
    next(e);
  }
};

const deleteFolder: any = async (req: any, res: any, next: any) => {
  try {
    const { folderUid } = req.params;
    await ItemModel.deleteMany({
      folderUid: mongoose.Types.ObjectId(folderUid)
    });
    await FolderModel.findByIdAndDelete(folderUid);
    res.send({});
  } catch (e) {
    console.log(
      'Error while deleting folder!',
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
  deleteFolder,
};