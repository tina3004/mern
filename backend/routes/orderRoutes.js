const express=require('express')
const { route } = require('./apiRoutes')
const {verifyIsLoggedIn,verifyIsAdmin}=require('../middleware/verifyAuthToken')
const {getUserOrders,getOrder,createOrder,updateOrderToPaid,updateOrderToDelivered,getOrders,getOrderForAnalysis} = require('../controllers/orderController')
const router=express.Router()

//user routes
router.use(verifyIsLoggedIn) //middleware to check if user is logged in
router.get('/', getUserOrders)
router.get("/user/:id",getOrder) //id of order item
router.post("/",createOrder)
router.put("/paid/:id",updateOrderToPaid)
//admin routes
router.use(verifyIsAdmin)
router.put("/delivered/:id",updateOrderToDelivered)
router.get("/admin",getOrders)
router.get("/analysis/:date",getOrderForAnalysis)
module.exports=router