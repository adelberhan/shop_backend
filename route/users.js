const User = require("../models/user")
const router = require('express').Router()
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');



//////Get all users//////
router.get(`/`, async (req, res) => {
    const userList = await User.find().select("-passwordHash ")
    if (!userList) { res.status(500).json({ success: false }) }
    res.send(userList)
})

//////POST a user//////
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//////get a user//////
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-passwordHash _id")
        if (!user) { res.status(404).json({ message: "user not found" }) }
        else res.status(200).send(user)
    } catch (err) {
        res.send({ err: err })
    }
})

//////update a user//////
router.put('/:id', async (req, res) => {
    try {
        const userExist = await User.findById(req.params.id)
        let newPassword
        if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password, 10)
        }
        else {
            newPassword = userExist.passwordHash
        }
        let user = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        }, { new: true })

        res.status(200).send(user)
    } catch (error) {
        res.status(404).send("User Not found...")

    }
})

//////Login//////
router.post("/login", async (req, res) => {
    const secret = process.env.SECRET
    const user = await User.findOne({ email: req.body.email })

    if (!user) { return res.status(400).send("user not found") }


    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        },
            secret,
            { expiresIn: '10d' })

        return res.status(200).send({ user: user.email, token: token })
    }
    else { return res.status(400).send("password wrong") }

})

//////Register//////
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

//////Count number of users///////
router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments()

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})

//////Delete a user//////
router.delete("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid user Id')
    }
    try {
        let user = await User.findByIdAndRemove(req.params.id)
        if (user) return res.status(200).json({ success: true, message: "the user deleted successfully" })
        else {
            return res.status(404).json({ success: false, user: "user not found" })
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})


module.exports = router