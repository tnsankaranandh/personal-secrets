const router = require('express').Router();
const Folder = require('../../models/Folder');

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
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find({});
    res.send(folders);
  } catch (e) {
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
    const folder = await Folder.findByIdAndDelete(_id);
    if (!folder) return res.sendStatus(404);

    return res.send({ message: 'Folder Deleted' });
  } catch (e) {
    return res.sendStatus(400);
  }
});

module.exports = router;
