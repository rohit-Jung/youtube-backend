import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //Uploading files on cloudinary using uplader method
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully on cloudinary");
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the local temporary file if the upload fails
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        const publicId = extractPublicIdFromUrl(url);

        if (!publicId) {
            throw new Error("Unable to extract public_id from URL");
        }
        // console.log(publicId);
        // Delete the resource using the public_id
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("File deleted successfully on Cloudinary");
        return result;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};

const extractPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const publicId = lastPart.split(".")[0]; // Removing file extension
    return publicId;
};

export { uploadOnCloudinary, deleteFromCloudinary };
