const Category = require("../models/category")
const router = require('express').Router()
// let { name, color, icon } = req.body;

//////Get all category //////
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find()
    res.send(categoryList)
})

////// Post a Category //////
router.post("/", async (req, res) => {
    let { name, color, icon } = req.body;
    let category = new Category({
        name, icon, color
        // name: req.body.name,
        // icon: req.body.icon,
        // color: req.body.color
    })
    category = await category.save()

    if (!category) { return res.status(404).send("The category cannot be created!!") }

    res.send(category)
})

//////Delete a Category//////
router.delete("/:id", async (req, res) => {
    try {
        let category = await Category.findByIdAndRemove(req.params.id)
        if (category) return res.status(200).json({ success: true, message: "the category deleted successfully" })
        else {
            return res.status(404).json({ success: false, category: "category not found" })
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})

//////find a Category//////
router.get("/:id", async (req, res) => {
    try {
        let category = await Category.findById(req.params.id)
        if (Category) return res.status(200).json({ success: true, message: "the message found successfully", category })
        else { return res.status(404).json({ message: "the category not found " }) }
    } catch (err) {
        res.status(400).json({ error: err })

    }
})

//////Update a Category//////

router.put('/:id', async (req, res) => {
    try {
        let { name, icon, color } = req.body;
        let category = await Category.findByIdAndUpdate(req.params.id, { name, icon, color }, { new: true })
        if (!category) { return res.status(404).send("Not found...") }
        return res.status(200).send(category)
    } catch (error) {
        res.json({ error: error })

    }
})

module.exports = router