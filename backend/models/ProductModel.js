const mongoose=require('mongoose');
const Review=require('./ReviewModel');
const imageSchema=mongoose.Schema({
    path:{
        type:String,
        required:true
    }
})

const productSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    count:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    rating:{
        type:Number,
    },
    reviewsNumber:{
        type:Number,
    },
    sales:{
        type:Number,
        default:0
    },
    attrs:[
        {key:{type:String},value:{type:String}}
        //[{key:"colour", value:"red"},{key:"size",value:"1 TB"}]
    ],
    images:[imageSchema],
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:Review
        }
    ]
},{
    timestamps:true  //created at and updated at timestamp
});
productSchema.index({name:"text", description:"text"},{name:"TextIndex"}) //for unique:true to work and indexing is done to search faster
productSchema.index({"attrs.key":1, "attrs.value":1})
const Product=mongoose.model('Product',productSchema);
module.exports=Product;