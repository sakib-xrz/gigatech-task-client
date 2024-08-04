import axios from "axios";

const CLOUDINARY_API_URL = process.env.NEXT_PUBLIC_CLOUDINARY_API_URL;
const NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadAudio = async (blob) => {
  let mp3Url;
  const formData = new FormData();
  formData.append("file", blob, "recording.mp3");
  formData.append("upload_preset", NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append("timestamp", `${Math.floor(Date.now() / 1000)}`);

  try {
    const response = await axios.post(CLOUDINARY_API_URL, formData);
    mp3Url = response.data.secure_url;
  } catch (error) {
    console.error(
      "Error uploading file:",
      error.response?.data || error.message,
    );
    mp3Url = null;
  }

  return mp3Url;
};
