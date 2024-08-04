"use client";

import axios from "axios";
import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";

export default function AudioTestPage() {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState("");

  const addAudioElement = async (blob) => {
    const audioUrl = URL.createObjectURL(blob);
    setUrl(audioUrl);

    // Upload the blob to Cloudinary
    const formData = new FormData();
    formData.append("file", blob, "recording.mp3");
    formData.append("upload_preset", "cwrwplhk");
    formData.append("timestamp", `${Math.floor(Date.now() / 1000)}`);

    const CLOUDINARY_API_URL =
      "https://api.cloudinary.com/v1_1/dgf7oj85d/upload";

    setUploading(true);

    try {
      const response = await axios.post(CLOUDINARY_API_URL, formData);
      const mp3Url = response.data.secure_url;
      setCloudinaryUrl(mp3Url);
      console.log("MP3 URL from Cloudinary:", mp3Url);

      // Optionally, store the URL in your database here
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message,
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        }}
        downloadOnSavePress={false}
        downloadFileExtension="mp3"
        showVisualizer={true}
      />
      {url && <audio src={url} controls />}
      {uploading && <p>Uploading...</p>}
      {cloudinaryUrl && (
        <p>
          Uploaded Audio URL:{" "}
          <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer">
            {cloudinaryUrl}
          </a>
        </p>
      )}
    </div>
  );
}
