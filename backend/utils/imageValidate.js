// if there is one image: req.files.images will be one object
// if there are multiple images: req.files.images will be an array of objects

const imageValidate=(images)=>{
    imagesTable=[]
    if(Array.isArray(images)){
        imagesTable=images
    }
    else{
        imagesTable.push(images)  //1 image 
    }

    if(imagesTable.length>3){
        return {error:"Send only 3 images at once"}
    }
    for(let image of imagesTable){
        if(image.size>1048576){
            return {error:"Size too large (above 1 MB"}
        }

        const filetypes=/jpeg|jpg|png/  //regex
        const mimetype=filetypes.test(image.mimetype)
        if(!mimetype){
            return {error:"Incorrect mimetype (should be jpg,jpeg,png)"};
        }
    }
    return {error:false}
}

module.exports=imageValidate