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

/**
 * Password hash middleware.
 */
itemSchema.pre('save', async function(next: Function) { //create item
  const item: any = this;
  item.password = await utils.encryptText(item.password);
  next();
});
itemSchema.pre('findOneAndUpdate', async function(next: Function) { //update item
  const item: any = this.getUpdate();
  item.password = await utils.encryptText(item.password);
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = {
  ItemModel: Item,
};