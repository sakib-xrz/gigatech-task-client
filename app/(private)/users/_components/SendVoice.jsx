"use client";

import "./customStyles.css";
import { AudioRecorder } from "react-audio-voice-recorder";
import Label from "@/components/shared/Label";
import { X } from "lucide-react";
import { Button } from "antd";

export default function SendVoice({ setBlob, url, setUrl }) {
  const addAudioElement = async (blob) => {
    const audioUrl = URL.createObjectURL(blob);
    setBlob(blob);
    setUrl(audioUrl);
  };

  const handelRemove = () => {
    setUrl("");
    setBlob(null);
  };

  return (
    <div className="space-y-1">
      <Label>Voice Message</Label>
      {url ? (
        <div className="flex items-center space-x-2">
          <audio src={url} controls className="w-full" />
          <Button onClick={handelRemove} danger icon={<X />} />
        </div>
      ) : (
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
          classes={{
            AudioRecorderClass: "audio-recorder",
          }}
        />
      )}
    </div>
  );
}
