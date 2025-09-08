const mongoose = require('mongoose');
const utils = require('../api/utils');

const { Schema } = mongoose;

const itemSchema: any = Schema(
  {
    folderUid: { type: Schema.Types.ObjectId, ref: 'Folder' },
    title: { type: String, unique: true },
    username: String,
    password: String,
    otherFields: Object,
    sensitiveKeys: [String],
  },
  { timestamps: true }
);

const encryptSensitiveFieldsOfItem = async (item: any) => {
  if (item.password) {
    item.password = await utils.encryptText(item.password);
  }
  const otherFieldKeys: string[] = Object.keys(item.otherFields || {});
  for (let a = 0; a < otherFieldKeys.length; a++) {
    const ofK = otherFieldKeys[a];
    if (item.sensitiveKeys.indexOf(ofK) > -1) {
      if (item.otherFields[ofK]) {
        item.otherFields[ofK] = await utils.encryptText(item.otherFields[ofK]);
      }
    }
  }
};
/**
 * Password hash middleware.
 */
itemSchema.pre('save', async function(next: Function) { //create item
  const item: any = this;
  await encryptSensitiveFieldsOfItem(item);
  next();
});
itemSchema.pre('findOneAndUpdate', async function(next: Function) { //update item
  const item: any = this.getUpdate();
  await encryptSensitiveFieldsOfItem(item);
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = {
  ItemModel: Item,
};