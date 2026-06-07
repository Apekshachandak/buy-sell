import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(fileBuffer, folder = 'trove') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    ).end(fileBuffer)
  })
}

export async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

export default cloudinary
