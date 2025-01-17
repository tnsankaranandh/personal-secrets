const router = require('express').Router();

router.use('/api/auth', require('./api/auth'));
router.use('/api/users', require('./api/users'));
router.use('/api/folders', require('./api/folders'));
router.use('/api/items', require('./api/items'));

module.exports = router;
