const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

router.get(`/`, async(req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
});

router.get(`/:id`, async(req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user)
        return res.status(500).send('product id not vaild');
    return res.status(200).json(user);
});

router.get(`/get/count`, async(req, res) => {
    const usersCount = await User.countDocuments({ isAdmin: false });
    if (!usersCount)
        return res.status(500).send('error while retrieving data');
    return res.status(200).send({ count: usersCount });

});

router.post(`/`, async(req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 6),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment
    });

    user = await user.save();

    if (!user)
        return res.status(500).send('the user cannot be created');

    res.status(200).json(user);
});

router.post(`/register`, async(req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 6),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment
    });

    user = await user.save();

    if (!user)
        return res.status(500).send('the user cannot be created');

    res.status(200).json(user);
});

router.post(`/login`, async(req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user)
        return res.status(400).send('The user not found');
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        }, secret, { expiresIn: '1d' });

        return res.status(200).send({ user: user.email, token: token });
    } else {
        return res.status(400).send('Wrong Password')
    }
});

module.exports = router;