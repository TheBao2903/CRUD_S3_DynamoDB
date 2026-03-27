import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws.js";
import { v4 as uuidv4 } from "uuid";
async function uploadImage(file) {
  if (!file) return null;

  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
}

async function deleteImage(imageUrl) {
  if (!imageUrl) return;

  try {
    const fileName = imageUrl.split("/").pop();
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
    };

    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export { uploadImage, deleteImage };
