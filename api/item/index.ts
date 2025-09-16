const { ItemModel } = require("../../models/Item");
const { doubleEncryptionUtils } = require("../utils");
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
    let previousItem = await ItemModel.findById(req.body._id);
    previousItem = previousItem.toObject();
    previousItem.folderUid = req.body.folderUid;
    previousItem.title = req.body.title;
    previousItem.username = req.body.username;
    if (req.body.password) previousItem.password = req.body.password;
    for (let ofK in req.body.otherFields) {
      previousItem.otherFields[ofK] = req.body.otherFields[ofK];
    }
    previousItem.sensitiveKeys = req.body.sensitiveKeys;
    const updatedItem = await ItemModel.findByIdAndUpdate(req.body._id, previousItem, {
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

    const keyUrls = await doubleEncryptionUtils.generateRSAKeyPairs();

    res.send({
      data: encryptedData,
      keyUrls,
    });
  } catch (e) {
    console.log(
      'Error while getting secured item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const unkownApi: any = async (req: any, res: any, next: any) => {
  try {
    const { randomValue } = req.query;
    const vercelBlobResponse = await fetch(randomValue);
    const vercelBlobData = await vercelBlobResponse.text();
    res.send({
      randomData: vercelBlobData,
    });
  } catch (e) {
    console.log(
      'Error while getting vercel blob item!',
      chalk.red('✗')
    );
    next(e);
  }
};

const decrypt: any = async (req: any, res: any, next: any) => {
  try {
    const { doubleEncryptedString, keyUrls } = req.body;
    const doubleDecryptedString: String = await doubleEncryptionUtils.decrypt(doubleEncryptedString, keyUrls);
    console.log(doubleDecryptedString, ' dd string ________________');
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
  unkownApi,
  decrypt,
};