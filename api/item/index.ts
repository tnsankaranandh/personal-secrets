const { ItemModel } = require("../../models/Item");
const chalk = require("chalk");

const list: any = async (req: any, res: any, next: any) => {
  try {
    const { folderUid } = req.params;
    let items = await ItemModel.find({ folderUid });
    res.send({ items });
  } catch (e) {
    console.log(
      'Error while listing items!',
      chalk.red('✗')
    );
    next(e);
  }
};

const create: any = async (req: any, res: any, next: any) => {
  try {
    console.log('in create item');
    console.log(req.body);
    const newItemObject = new ItemModel(req.body);
    await newItemObject.save();
    res.send(newItemObject);
  } catch (e) {
    console.log(
      'Error while creating item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const detail: any = async (req: any, res: any, next: any) => {
  try {
    const { itemUid } = req.params;
    let item = await ItemModel.findById(itemUid);
    item = item.toObject();
    item.password = "----------";
    res.send({ item });
  } catch (e) {
    console.log(
      'Error while getting item detail!',
      chalk.red('✗')
    );
    next(e);
  }
};

const update: any = async (req: any, res: any, next: any) => {
  try {
    console.log(req.body);
    const updatedItem = await ItemModel.findByIdAndUpdate(req.body._id, {
      folderUid: req.body.folderUid,
      title: req.body.title,
      username: req.body.username,
      password: req.body.password,
      otherFields: req.body.otherFields,
    }, {
      new: true
    });
    console.log(updatedItem);
    res.send(updatedItem);
  } catch (e) {
    console.log(
      'Error while updating item!',
      chalk.red('✗')
    );
    next(e);
  }
};

module.exports = {
  list,
  create,
  detail,
  update,
};