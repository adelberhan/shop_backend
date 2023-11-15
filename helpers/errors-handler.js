
function errorHandler(err, req, res, next) {

    //// jwt authentication error ////
    if (err.name === "UnauthorizedError")
        return res.status(401).json({ message: "you are unauthorized" })


    /////validation Error  ////
    if (err.name === "validationError")
        return res.status(401).json({ message: err })


    //// Server error
    res.status(500).json({ message: "Internal server error",err:err.name})
}

module.exports = errorHandler
