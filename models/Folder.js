const mongoose = require('mongoose');

const { Schema } = mongoose;

const folderSchema = Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
