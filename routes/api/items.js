const router = require('express').Router();
const Item = require('../../models/Item');

router.post('/', async (req, res) => {
  const item = new Item(req.body);
  try {
    await item.save();
    res.status(201).send({ item });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/getbyfolder/:folderUid', async (req, res) => {
  try {
    const folderUid = req.params.folderUid;
    const items = await Item.find({ folderUid });
    res.send(items);
  } catch (e) {
    console.error('Error while getting items list : ', e);
    res.status(400).send(e);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const _id = req.params.id;
    const item = await Item.findById(_id);
    res.send(item);
  } catch (e) {
    console.error('Error while getting items : ', e);
    res.status(400).send(e);
  }
});

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

router.put('/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const item = await Item.findByIdAndUpdate(_id, req.body);
    if (!item) return res.sendStatus(404);

    return res.send({ message: 'Item Updated' });
  } catch (e) {
    return res.sendStatus(400);
  }
});

module.exports = router;
