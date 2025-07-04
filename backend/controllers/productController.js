//in controllers we will directly be fetching data from the database
const recordsPerPage=require("../config/pagination")
const Product=require("../models/ProductModel")
const imageValidate=require("../utils/imageValidate")

const getProducts=async (req,res,next)=>{
    try{
        let query={}  //pass this query object to the find method
        let queryCondition=false
        let priceQueryCondition={}
        if(req.query.price){
            queryCondition=true
            priceQueryCondition={price:{$lte:Number(req.query.price)}} //lte means less than or equal to(mongodb syntax)
        }

        let ratingQueryCondition={}
        if(req.query.rating){
            queryCondition=true
            ratingQueryCondition={rating:{$in:req.query.rating.split(",")}} //splitting the query by comma and passing it to the $in operator
        }
        //user searches through search bar(localhost:3000/api/products/category/Tablets)
        let categoryQueryCondition={}
        const categoryName=req.params.categoryName || ""
        if(categoryName){
            queryCondition=true
            let a=categoryName.replace(/,/g,"/")
            var regEx=new RegExp("^" + a) 
            categoryQueryCondition={category:regEx}
        }
        //user filters through the filter bar()
        if(req.query.category){
            queryCondition=true;
            let a=req.query.category.split(",").map((item)=>{
                if(item) return new RegExp("^" + item)
            })
            categoryQueryCondition={category:{$in:a}}
        }

        let attrsQueryCondition = [];
        if (req.query.attrs) {
        // attrs=RAM-1 TB-2 TB-4 TB,color-blue-red
        // [ 'RAM-1 TB-4 TB', 'color-blue', '' ]
        attrsQueryCondition = req.query.attrs.split(",").reduce((acc, item) => {
            if (item) {
            let a = item.split("-");
            let values = [...a]; // copy of a
            values.shift(); // removes first item
            let a1 = {
                attrs: { $elemMatch: { key: a[0], value: { $in: values } } }, /*$elemMatch → This operator is used when querying an array of objects. It ensures that at least one element in the array matches the given conditions.*/
            };
            acc.push(a1);
            console.dir(acc, { depth: null })
            return acc;
            } else return acc;
        }, []);
        //   console.dir(attrsQueryCondition, { depth: null });
        queryCondition = true;
        }

        //pagination
        const pageNum=Number(req.query.pageNum) || 1
        
        let sort={}
        const sortOption=req.query.sort||""
        if(sortOption){
            let sortOpt=sortOption.split("_") //sortOption will be like price_1 or price_-1
            sort={[sortOpt[0]]:Number(sortOpt[1])} //sortOpt[1] is the value of the key
            //[sortOpt[0]] this is in [] brackets because this is a dynamic key
        }

        const searchQuery=req.params.searchQuery || ""
        let searchQueryCondition={}
        let select={}
        if(searchQuery){
            queryCondition=true;
            searchQueryCondition={$text:{$search:searchQuery}} //this is the mongodb syntax for text search
            select={
                score:{$meta:"textScore"} //this will return the score of the search result(accuracy of the search result)
            }
            sort={score:{$meta:"textScore"}} //this will sort the search result based on the score by default, MongoDB sorts text scores in descending order (highest relevance first).

        }
        if(queryCondition){
            query={
                $and:[priceQueryCondition,ratingQueryCondition,categoryQueryCondition,searchQueryCondition,
                    ...attrsQueryCondition //this will spread the array of objects and include all attributes
                ]
            } //this is the final query object
        }


        const totalProducts=await Product.countDocuments(query)
        const products=await Product.find(query)
        .select(select)
        .sort(sort)
        .limit(recordsPerPage)
        .skip(recordsPerPage*(pageNum-1))
        res.json({products,pageNum,paginationLinksNumber:Math.ceil(totalProducts/recordsPerPage)})
    }
    catch(error){
        next(error)
    }
}

const getProductbyId=async (req,res,next)=>{
    try{
        const product=await Product.findById(req.params.id).populate("reviews").orFail() //populate is used to extract the review data of the product from the review id
        res.json(product)
    }
    catch(err){
        next(err)
    }
}

const getBestsellers=async (req,res,next)=>{
    try{
        const products=await Product.aggregate([ 
            {$sort:{category:1,sales:-1}}, //sort the products based on category and sales in descending order    
            {$group:{_id:"$category",doc_with_max_sales:{ $first: "$$ROOT" }}}, //group the products based on category and get the first product of each category(first would be the highest as it is sorted in descending order)
            {$replaceWith:"$doc_with_max_sales"}, //replace the grouped product with the product with the highest sales
            {$match:{sales:{$gt:0}}}, //match the products with sales greater than 0
            {$project:{_id:1,name:1,images:1,category:1,description:1 }}, //project only the required fields
            {$limit:3}
        ])
        res.json(products)
    }
    catch(err){
        next(err)
    }
}

const adminGetProducts =async (req,res,next)=>{
    try{
        const products=await Product.find({}).sort({category:1}).select("name price category");
        return res.json(products)
    }catch(err){
        next(err)
    }
}

const adminDeleteProduct=async(req,res,next)=>{
    try{
        const product=await Product.findById(req.params.id).orFail()
        await product.remove()
        res.json({message:"Product removed"})
    }catch(err){
        next(err)
    }
}

const adminCreateProduct=async(req,res,next)=>{
    try{
        const product=new Product()
        const {name,description,count,price,category,attributesTable}=req.body
        product.name=name
        product.description=description
        product.count=count
        product.price=price
        product.category=category
        if(attributesTable.length>0){
            attributesTable.map((item)=>{
                product.attrs.push(item)
            })
        }
        await product.save()

        res.json({message:"Product created",
            productId:product._id})
    }catch(err){
        next(err)
    }
}

const adminUpdateProduct=async(req,res,next)=>{
    try{
       const product=await Product.findById(req.params.id).orFail()
       const {name,description,count,price,category,attributesTable}=req.body
        product.name=name || product.name
        product.description=description || product.description
        product.count=count || product.count
        product.price=price || product.price
        product.category=category || product.category
        if(attributesTable.length>0){
            product.attrs=[]
            attributesTable.map((item)=>{
                product.attrs.push(item)
            })
        }else{
            product.attrs=[]
        }
        await product.save()
        res.json({message:"Product updated"})
    }catch(err){
        next(err)
    }
}


//for fileupload : npm i express-fileupload
//for naming the file: npm i uuid
const adminUpload=async(req,res,next)=>{
    if(req.query.cloudinary==="true"){
        try{
            let product=await Product.findById(req.query.productId).orFail();
            product.images.push({path:req.body.url})
            await product.save()
        }catch(er){
            next(er)
        }
        return
    }
    try{
        if(!req.files || req.files.images ===false){
            return res.status(400).send("No files were uploaded")
        }

        const validateResult=imageValidate(req.files.images)
        if(validateResult.error){
            return res.status(400).send(validateResult.error)
        }
        imagesTable=[]        
        if(Array.isArray(req.files.images)){
            imagesTable=req.files.images
        }
        else{
            imagesTable.push(req.files.images)
        }
        const path =require("path")
        const {v4:uuidv4}=require("uuid")
        const uploadDirectory=path.resolve(__dirname, "../../frontend","public","images","products")
        

        let product =await Product.findById(req.query.productId).orFail()

        for(let image of imagesTable){
            // console.log(image)  //image obj has many properties like name, data, size, mimetype etc
            // console.log(path.extname(image.name))
            // console.log(uuidv4())

            var filename =uuidv4() + path.extname(image.name)
            var uploadPath=uploadDirectory + "/" + filename
            product.images.push({path:"/images/products/" + filename})
            image.mv(uploadPath,(err)=>{
                if(err){
                    return res.status(500).send(err);
                }
            })
        }
        await product.save()
        return res.send("Files uploaded")
    }catch(err){
        next(err)
    }
}

const adminDeleteProductImage = async (req, res) => {

    const imagePath = decodeURIComponent(req.params.imagePath)
    if(req.query.cloudinary==="true"){
        try{
            await Product.findOneAndUpdate({_id:req.params.productId},{$pull:{images:{ path :imagePath}}}).orFail();
            return res.end();
        }
        catch(er){
            next(er);
        }
        return;
    }
    try{
        const path = require("path")
        const finalPath = path.resolve("../frontend/public") + imagePath
        
        const fs=require("fs")
        fs.unlink(finalPath,(err)=>{
            if(err){
                res.status(500).send(err);
            }
        })

        await Product.findOneAndUpdate({_id:req.params.productId},{$pull:{images:{ path :imagePath}}}).orFail();
        return res.end()
    }catch(err){
        next(err);
    }
    
}
module.exports={getProducts,getProductbyId,getBestsellers,adminGetProducts,adminDeleteProduct,adminCreateProduct,adminUpdateProduct,adminUpload,adminDeleteProductImage};