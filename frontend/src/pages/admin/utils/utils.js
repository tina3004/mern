import axios from "axios";

export const uploadImagesApiRequest=async(images,productId)=>{
  const formData=new FormData();
  Array.from(images).forEach(image=>{
    formData.append("images",image);
  })
  const {data}=await axios.post(`/api/products/admin/upload?productId=`+productId,formData)
  return data;
}

export const uploadImagesCloudinaryApiRequest = (images,productId) => {
    const url = "https://api.cloudinary.com/v1_1/dbekna5uf/image/upload";
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
        let file = images[i];
        formData.append("file", file);
        formData.append("upload_preset", "dgsuryhbye");
        fetch(url, {
            method: "POST",
            body: formData,
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            axios.post("/api/products/admin/upload?cloudinary=true&productId="+productId,data)
        })
    }
}

/*data is the entire javascript object
{
    "asset_id": "d8f5f0f37cc4391ac4b243a97999a644",
    "public_id": "uz6r1j7sgguzzrw7flpa",
    "version": 1750241506,
    "version_id": "de7fde5b7436fa186efb8f0f4a00ede4",
    "signature": "225849309322b5cf8c7f76bb848eef2058a11877",
    "width": 299,
    "height": 168,
    "format": "jpg",
    "resource_type": "image",
    "created_at": "2025-06-18T10:11:46Z",
    "tags": [],
    "bytes": 6096,
    "type": "upload",
    "etag": "901552f979cb2e1c60651c6fbfe9f81e",
    "placeholder": false,
    "url": "http://res.cloudinary.com/dbekna5uf/image/upload/v1750241506/uz6r1j7sgguzzrw7flpa.jpg",
    "secure_url": "https://res.cloudinary.com/dbekna5uf/image/upload/v1750241506/uz6r1j7sgguzzrw7flpa.jpg",
    "asset_folder": "",
    "display_name": "eagle",
    "original_filename": "eagle",
    "original_extension": "jpeg"
}*/