import multer from 'multer';
import DataURI from 'datauri/parser.js';
import path from 'path';
const datauri = new DataURI();
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('profileImage');

/**
 * @param {Object} req
 * @returns an array of url strings
 */
const imageDataUri = (req: { body?: any; file: any; }) => {
    const urlString = path.extname(req.file.originalname).toString();

    return datauri.format(urlString, req.file.buffer);
}

export { 
    multerUploads, 
    imageDataUri
}