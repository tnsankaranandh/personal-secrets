const mongoose = require('mongoose');

const { Schema } = mongoose;

const folderSchema: any = Schema(
  {
    name: { type: String, unique: true },
  },
  { timestamps: true }
);

const Folder = mongoose.model('Folder', folderSchema);

module.exports = {
  FolderModel: Folder,
};
