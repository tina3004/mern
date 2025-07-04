const express=require('express')
const { route } = require('./apiRoutes')
const {getProducts,getProductbyId,getBestsellers,adminGetProducts,adminDeleteProduct,adminCreateProduct,adminUpdateProduct,adminUpload,adminDeleteProductImage}= require('../controllers/productController')
const {verifyIsLoggedIn,verifyIsAdmin}=require('../middleware/verifyAuthToken')
const { get } = require('mongoose')
const router=express.Router()
/* In your Express route definitions, if you define a dynamic route ("/:id") before a specific static route (like "/bestsellers"), Express interprets "bestsellers" as a value for ":id". This causes an issue when Mongoose tries to cast "bestsellers" as an ObjectId. To fix this, you need to define the static route before the dynamic route. */
router.get('/', getProducts)
router.get('/category/:categoryName', getProducts)
router.get("/category/:categoryName/search/:searchQuery",getProducts)
router.get("/search/:searchQuery",getProducts)
router.get("/bestsellers",getBestsellers)
router.get("/get-one/:id",getProductbyId)

//admin
router.use(verifyIsLoggedIn)  //before handling any of the routes below this middleware will be called
router.use(verifyIsAdmin)
router.get("/admin",adminGetProducts)
router.delete("/admin/:id",adminDeleteProduct)
router.delete("/admin/image/:imagePath/:productId", adminDeleteProductImage)
router.put("/admin/:id",adminUpdateProduct)
router.post("/admin/upload",adminUpload)
router.post("/admin",adminCreateProduct)
module.exports=router