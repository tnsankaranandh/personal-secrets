const router = require('express').Router();
const Item = require('../../models/Item');

/**
 * @route   POST /users
 * @desc    Register new user
 * @access  Public
 */
router.post('/', async (req, res) => {
  const folder = new Folder(req.body);
  try {
    await folder.save();
    res.status(201).send({ folder });
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private
 */
router.get('/:folderUid', async (req, res) => {
  try {
    const folderUid = req.params.folderUid;
    const items = await Item.find({ folderUid });
    res.send(items);
  } catch (e) {
    console.error('Error while getting items list : ', e);
    res.status(400).send(e);
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Delete user by id
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const item = await Item.findByIdAndDelete(_id);
    if (!item) return res.sendStatus(404);

    return res.send({ message: 'Item Deleted' });
  } catch (e) {
    return res.sendStatus(400);
  }
});

module.exports = router;
