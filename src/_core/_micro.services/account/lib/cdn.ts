// import { v2 as cloudinary } from 'cloudinary';
import configs from '../configs/index.js';



// TODO... remove comment when cloudinary is installed

// cloudinary.config({
//     cloud_name: configs.cloudinary.cloudName,
//     api_key: configs.cloudinary.apiKey,
//     api_secret: configs.cloudinary.secret
// });


export async function uploadimageToCDN(img: string) {
    // const uploadImg = await cloudinary.uploader.upload(img);
    // return uploadImg;
    return {} 
}