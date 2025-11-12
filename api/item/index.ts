const { ItemModel } = require("../../models/Item");
const { doubleEncryptionUtils, decryptData } = require("../utils");
const chalk = require("chalk");

const list: any = async (req: any, res: any, next: any) => {
  try {
    const { folderUid } = req.params;
    let items = await ItemModel.find({ folderUid }).sort({ title: 1 });
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
    const newItemObject = new ItemModel(decryptData(req.body));
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
    item.password = '';
    (item.sensitiveKeys || []).forEach((sk: any) => {
      (item.otherFields || {})[sk] = '';
    });
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
    const decryptedBody = decryptData(req.body);
    console.log('decrypted body ', decryptedBody);
    let previousItem = await ItemModel.findById(decryptedBody._id);
    previousItem = previousItem.toObject();
    previousItem.folderUid = decryptedBody.folderUid;
    previousItem.title = decryptedBody.title;
    previousItem.username = decryptedBody.username;
    if (decryptedBody.password) previousItem.password = decryptedBody.password;
    for (let ofK in decryptedBody.otherFields) {
      previousItem.otherFields[ofK] = decryptedBody.otherFields[ofK];
    }
    previousItem.sensitiveKeys = decryptedBody.sensitiveKeys;
    const updatedItem = await ItemModel.findByIdAndUpdate(decryptedBody._id, previousItem, {
      new: true
    });
    res.send(updatedItem);
  } catch (e) {
    console.log(
      'Error while updating item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const deleteItem: any = async (req: any, res: any, next: any) => {
  try {
    const { itemUid } = req.params;
    await ItemModel.findByIdAndDelete(itemUid);
    res.send({});
  } catch (e) {
    console.log(
      'Error while deleting item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const getSecuredFieldValue: any = async (req: any, res: any, next: any) => {
  try {
    const { itemUid, field } = req.body;
    const item = await ItemModel.findById(itemUid);
    const separateFields = field?.split('.');
    let encryptedData = item;
    separateFields.forEach((sf: any) => {
      encryptedData = encryptedData[sf];
    });

    res.send({
      data: encryptedData,
      randomUid: await doubleEncryptionUtils.generateRSAKeyPairs(),
    });
  } catch (e) {
    console.log(
      'Error while getting secured item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const decrypt: any = async (req: any, res: any, next: any) => {
  try {
    const { doubleEncryptedString, randomUid } = req.body;
    const doubleDecryptedString: String = await doubleEncryptionUtils.decrypt(doubleEncryptedString, randomUid);
    res.send({
      decryptedValue: doubleDecryptedString,
    });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  } catch (e) {
    console.log(
      'Error while getting secured item!',
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
  deleteItem,
  getSecuredFieldValue,
  decrypt,
};