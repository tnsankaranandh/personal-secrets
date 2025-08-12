const { ItemModel } = require("../../models/Item");
const chalk = require("chalk");

const list: any = async (req: any, res: any) => {
  try {
    const { folderUid } = req.params;
    let items = await ItemModel.find({ folderUid });
    res.send({ items });
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while listing items!',
      chalk.red('✗')
    );
    throw (e);
  }
};

const create: any = async (req: any, res: any) => {
  try {
    console.log('in create item');
    console.log(req.body);
    const newItemObject = new ItemModel(req.body);
    await newItemObject.save();
    res.send(newItemObject);
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while creating item!',
      chalk.red('✗')
    );
    throw (e);
  }
};

const detail: any = async (req: any, res: any) => {
  try {
    const { itemUid } = req.params;
    let item = await ItemModel.findById(itemUid);
    res.send({ item });
  } catch (e) {
    console.error(e.message);
    console.log(
      'Error while getting item detail!',
      chalk.red('✗')
    );
    throw (e);
  }
};

module.exports = {
  list,
  create,
  detail
};