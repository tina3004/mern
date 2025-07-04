const express=require('express')
const { route } = require('./apiRoutes')
const {getCategories,newCategory,deleteCategory,saveAttr} = require('../controllers/categoryController')
const router=express.Router()
const {verifyIsLoggedIn,verifyIsAdmin}=require('../middleware/verifyAuthToken')

router.get('/', getCategories)

router.use(verifyIsLoggedIn)  //before handling any of the routes below this middleware will be called
router.use(verifyIsAdmin)
router.post('/', newCategory)
router.delete('/:category',deleteCategory)
router.post("/attr", saveAttr)
module.exports=router