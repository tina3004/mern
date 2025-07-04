const express=require('express')
const { route } = require('./apiRoutes')
const {verifyIsLoggedIn,verifyIsAdmin}=require('../middleware/verifyAuthToken')
const {getUsers,registerUser,loginUser,updateUserProfile,getUserProfile,writeReview,getUser,updateUser,deleteUser} = require('../controllers/userController')
const router=express.Router()


router.post('/register', registerUser)
router.post('/login',loginUser)

//user logged in routes
router.use(verifyIsLoggedIn) //middleware to check if user is logged in
router.put('/profile',updateUserProfile)
router.get('/profile/:id',getUserProfile)
router.post('/review/:productId',writeReview)

//admin routes
router.use(verifyIsAdmin)
router.get('/', getUsers)
router.get('/:id',getUser)
router.put("/:id",updateUser)
router.delete("/:id",deleteUser)
module.exports=router