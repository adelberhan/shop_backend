const Product = require("../models/product")
const router = require('express').Router()
const Category = require("../models/category")
const mongoose = require('mongoose');
const multer = require('multer')

///////////// Multer Config /////////////
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid img Type')
        if (isValid) { uploadError = null }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        // Replace every space with (_) in the file name
        const fileName = file.originalname.split(' ').join('_');
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}`)
    }
})
const uploadOptions = multer({ storage: storage })
/////////////////////////////////////////

////Get all products//////
// router.get(`/`, async (req, res) => {
//     const productList = await Product.find();
//     res.send(productList)
// })

//////filter Products By category//////
router.get(`/`, async (req, res) => {
    let filter = {}
    if (req.query.category) {
        filter = { category: req.query.category.split(',') }
    }

    const productList = await Product.find(filter).populate("category");
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(
        productList
    );


})

//////find a product//////
router.get(`/:id`, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id)
        if (product) return res.status(200).json({ success: true, message: "the product found successfully", product })
        else { return res.status(404).json({ message: "the product not found " }) }
    } catch (err) {
        res.status(400).json({ error: err })

    }
})

//////POST a product//////
router.post(`/`, uploadOptions.single('img'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send("invalid category")
    const file = req.file
    if (!file) return res.status(400).send("There is no image in the request")

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        img: `${basePath}${fileName}`,
        imgs: req.body.imgs,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated
    });
    product = await product.save();

    if (!product) res.status(500).send("The product cannot be created")

    res.send(product)

})

//////update a product//////

router.put('/:id', uploadOptions.single('img'), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id)
    if (!product) return res.status(400).send('Invalid Category')

    const file = req.file
    let newImgPath

    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        newImgPath = `${basePath}${fileName}`
    } else {
        newImgPath = product.img
    }
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            img: newImgPath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    )

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct);
})

//////Delete a product//////
router.delete("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    try {
        let product = await Product.findByIdAndRemove(req.params.id)
        if (product) return res.status(200).json({ success: true, message: "the product deleted successfully" })
        else {
            return res.status(404).json({ success: false, product: "product not found" })
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})

//////Delete all product//////
router.delete("/", async (req, res) => {
    try {
        let product = await Product.remove()
        if (product) return res.status(200).json({ success: true, message: "All products deleted successfully" })
        else {
            return res.status(404).json({ success: false, product: "product not found" })
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err })
    }
})

//////count all product//////
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });


})

//////get featured//////
router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const product = await Product.find({ isFeatured: true }).limit(+count)
    if (!product) {
        res.status(500).json({ success: false })
    }
    res.send({
        product
    });


})

//////Upload a gallery category//////
router.put('/gallery-imgs/:id', uploadOptions.array('imgs', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const files = req.files;
    let imgsPath = []
    if (files) {
        files.map(file => {
            imgsPath.push(`${basePath}${file.filename}`)
        })
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            imgs: imgsPath
        },
        { new: true }
    )

    if (!product)
        return res.status(500).send('the product cannot be updated!')

    res.send(product);
})

module.exports = router