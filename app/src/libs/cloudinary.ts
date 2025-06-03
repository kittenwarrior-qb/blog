import axios from 'axios';

export const uploadImage = async (img: File): Promise<string | null> => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`);
    const { api_key, timestamp, public_id, signature, folder, cloud_name } = res.data.uploadData;

    const formData = new FormData();
    formData.append("file", img);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("public_id", public_id);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      formData
    );

    return uploadRes.data.secure_url;
  } catch (error: any) {
    console.error("Image upload failed:", error.message || error);
    return null;
  }
};
