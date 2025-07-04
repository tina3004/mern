const jwt = require('jsonwebtoken')

const verifyIsLoggedIn=(req,res,next)=>{
    try{
        const token =req.cookies.access_token //express is not able to read cookies from the browser we need to install cookie-parser
        if(!token){
            return res.status(403).send("A token is required for authentication")
        }
        try{
            const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
            //after verification, decoded will contain the user details(name,email,etc) and then is assigned to req.user
            req.user=decoded  //all of the data will be available for every request this middleware 
            next()
        }catch(err){
            return res.status(401).send("Unauthorized.Invalid token")
        }
    }catch(err){
        next(err)
    }
}

const verifyIsAdmin=(req,res,next)=>{
    //req.user is created in the first middleware
    if(req.user && req.user.isAdmin){
        next()
    }
    else{
        return res.status(401).send("Unauthorized.Admin required")
    }
}

module.exports={verifyIsLoggedIn,verifyIsAdmin}