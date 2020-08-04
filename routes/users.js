const express = require('express');
const router = express.Router();
const auth = require('../middleware/check-auth');

const usersController = require('../controllers/users');

router.post('/signup', usersController.signup);

router.post('/login', usersController.login);

router.get('/profile', auth.user, usersController.profile);

router.get('/', auth.admin, usersController.getUsers);

router.get('/:uid', auth.admin, usersController.getUserById);

router.patch('/:uid', auth.admin, usersController.updateUser);

router.delete('/:uid', auth.admin, usersController.deleteUser);

module.exports = router;
