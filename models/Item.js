const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema = Schema(
  {
    title: String,
    username: String,
    password: String,
    notes: String,
    folderUid: { type: Schema.Types.ObjectId, ref: 'Folder' }
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
