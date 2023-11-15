/////////////Packages/////////////
const path = require('path')
const express = require('express')
const app = express()
const dotenv = require("dotenv")
const morgan = require("morgan")
const mongoose = require("mongoose")
const connectDB = require("./config/dp")
const cors = require("cors")
const authJwt = require("./helpers/jwt")
const errorHandler = require("./helpers/errors-handler")



///////////// CORS /////////////
app.use(cors())
app.options("*", cors())


/////////////Middleware/////////////
app.use(express.json())
app.use(morgan("tiny"))
app.use(authJwt())
app.use('/public/uploads',express.static(__dirname +'/public/uploads'));
app.use(errorHandler)

/////////////Router///////////
const productRouter = require("./route/products")
const userRouter = require("./route/users")
const ordersRouter = require("./route/orders")
const categoryRouter = require("./route/categories")
const orderItemRouter = require("./route/order_items")

/////////////Models///////////
const Product = require("./models/product")
const User = require("./models/user")
const Category = require("./models/category")
const Order = require("./models/order")
const OrderItem = require("./models/order_item")


/////////////local config/////////////
dotenv.config({ path: "./config/config.env" })
const api = process.env.API_URL


/////////////API/////////////
app.use(`${api}/products`, productRouter)
app.use(`${api}/users`, userRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/order_item`, orderItemRouter)


///////////// DB connection /////////////
connectDB()

///////////// App /////////////
const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`app listening on port ${PORT}!`))
