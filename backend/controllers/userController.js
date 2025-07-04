const User=require("../models/UserModel")
const {hashPassword,comparePasswords}=require("../utils/hashPassword")
const generateAuthToken=require("../utils/generateAuthToken")
const Product = require("../models/ProductModel");
const Review=require("../models/ReviewModel")

const getUsers=async(req,res,next)=>{
    try{
        const users=await User.find({}).select("-password");
        return res.json(users);
    }catch(err){
        next(err);
    }
} 

const registerUser=async(req,res,next)=>{
    try{
        const {name,lastName,email,password}=req.body;
        if(!(name && lastName && email && password)){
            return res.status(400).send("All inputs are required");
        }

        const userExists=await User.findOne({email})
        if(userExists){
            return res.status(400).send({message:"User exists"})
        }
        else{
            const hashedPassword=hashPassword(password)
            const user=await User.create({
                name,lastName, email: email.toLowerCase(),password:hashedPassword
            }) 
            res.cookie("access_token",generateAuthToken(user._id,user.name,user.lastName,user.email,user.isAdmin),{
                httpOnly:true, //cookie can be accessed only using  http protocol
                secure:process.env.NODE_ENV==='production',
                sameSite:"strict" //"strict" → The cookie won’t be sent in cross-site requests (e.g., when a user clicks a link from another site).
                //Example:
                // If a user visits yourwebsite.com, the cookie is sent.
                // If they visit anotherwebsite.com and then navigate to yourwebsite.com, the cookie is not sent.
            })
            res.status(201).json({success:"User Created", userCreated:{_id:user._id, name:user.name,lastName:user.lastName, email:user.email,isAdmin:user.isAdmin}})       //remember to write this inside else block    
        }
        
    }catch(err){
        next(err)
    }
}

const loginUser=async(req,res,next)=>{
    try{
        const {email,password,doNotLogout}=req.body;
        if(!(email && password)){
            return res.status(400).send("All inputs are required");
        }
        const user=await User.findOne({email}).orFail();
        if(user && comparePasswords(password,user.password)){
            let cookieParams={
                httpOnly:true, //cookie can be accessed only using  http protocol
                secure:process.env.NODE_ENV==='production',
                sameSite:"strict" //"strict" → The cookie won’t be sent in cross-site requests (e.g., when a user clicks a link from another site).
                //Example:
                // If a user visits yourwebsite.com, the cookie is sent.
                // If they visit anotherwebsite.com and then navigate to yourwebsite.com, the cookie is not sent.
            }
            if(doNotLogout){
                cookieParams={...cookieParams,maxAge:1000*60*60*24*7} //This is the spread operator, which copies all key-value pairs from the cookieParams object.
            }
            return res.cookie("access_token",
                generateAuthToken(user._id,user.name,user.lastName,user.email,user.isAdmin),
                cookieParams).
                json({success:"User Logged In", userLoggedIn:{_id:user._id, name:user.name,lastName:user.lastName, email:user.email,isAdmin:user.isAdmin,doNotLogout}}) 

            
        }else{
            return res.status(401).send("Wrong credentials")
        }
    }catch(err){
        next(err)
    }
}

const updateUserProfile = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).orFail(); //req.user is created in the verifyIsLoggedIn middleware
      user.name = req.body.name || user.name;
      user.lastName = req.body.lastName || user.lastName;
      user.phoneNumber = req.body.phoneNumber;
      user.address = req.body.address;
      user.country = req.body.country;
      user.zipCode = req.body.zipCode;
      user.city = req.body.city;
      user.state = req.body.state;
      if (req.body.password && req.body.password !== user.password) {
        user.password = hashPassword(req.body.password);
      }
      await user.save();
  
      res.json({
        success: "user updated",
        userUpdated: {
          _id: user._id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      next(err);
    }
};

const getUserProfile=async(req,res,next)=>{
    try{
        const user=await User.findById(req.params.id).orFail();
        return res.send(user);
    }catch(err){
        next(err)
    }
}

const writeReview=async(req,res,next)=>{
    try{

        const session=await Review.startSession();
        const{comment,rating}=req.body;

        if(!(comment && rating)){
            return res.status(400).send("All inputs are required");
        }
        //create review id manually because it is also needed for savivng in Product collection
        const ObjectId=require("mongodb").ObjectId; //Uses ObjectId from MongoDB to generate a unique ID for the review
        let reviewId=new ObjectId();

        session.startTransaction(); //start a transaction before the first database operation
        await Review.create([
            {
                _id:reviewId,
                comment,
                rating:Number(rating),
                user:{
                    _id:req.user._id,
                    name:req.user.name + " " + req.user.lastName
                }
            }
        ], {session:session});

        const product = await Product.findById(req.params.productId).populate("reviews").session(session);
        // res.send(product)

        const alreadyReviewed = product.reviews.find((r) => r.user._id.toString() === req.user._id.toString());
        // const alreadyReviewed = await Review.findOne({
        //     user: { _id: req.user._id },
        //     _id: { $in: product.reviews },
        // });
        if (alreadyReviewed) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send("Product already reviewed");
        }

        let prc = [...product.reviews];
        prc.push({ rating: rating });
        product.reviews.push(reviewId);
        if (product.reviews.length === 1) {
            product.rating = Number(rating);
            product.reviewsNumber = 1;
        } else {
            product.reviewsNumber = product.reviews.length;
            let ratingCalc = prc.map((item) => Number(item.rating)).reduce((sum, item) => sum + item, 0) / product.reviews.length;
            product.rating = Math.round(ratingCalc)
        }
        await product.save();

        await session.commitTransaction();
        session.endSession();
        res.send("Review created")
    }
    catch(err){
        await session.abortTransaction();
        next(err)
    }
}

const getUser=async(req,res,next)=>{
    try{
        const user=await User.findById(req.params.id).select("name lastName email isAdmin").orFail();
        return res.send(user)
    }catch(err){
        next(err)
    }
}
const updateUser=async(req,res,next)=>{
    try{
        const user=await User.findById(req.params.id).orFail();
        user.name=req.body.name || user.name;
        user.lastName=req.body.lastName || user.lastName;
        user.email=req.body.email || user.email;
        user.isAdmin=req.body.isAdmin;
        await user.save();
        res.send("User updated")
    }
    catch(err){
        next(err)
    }
}

const deleteUser=async(req,res,next)=>{
    try{
        const user=await User.findById(req.params.id).orFail();
        await user.remove();
        res.send("User removed")
    }catch(err){
        next(err)
    }
}

module.exports={getUsers,registerUser,loginUser,updateUserProfile,getUserProfile,writeReview,getUser,updateUser,deleteUser};