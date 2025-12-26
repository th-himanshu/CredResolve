const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const groupController = require('../controllers/groupController');

router.post('/', auth, groupController.createGroup);
router.get('/', auth, groupController.getGroups);
router.get('/:id', auth, groupController.getGroupDetails);
router.post('/:id/members', auth, groupController.addMember);

module.exports = router;
