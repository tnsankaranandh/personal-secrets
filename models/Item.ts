const mongoose = require('mongoose');

const { Schema } = mongoose;

const itemSchema: any = Schema(
  {
    folderUid: { type: Schema.Types.ObjectId, ref: 'Folder' },
    title: { type: String, unique: true },
    username: String,
    password: String,
    otherFields: Object,
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

export default Item;