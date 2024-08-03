import { Spin } from "antd";

export default function Loading({ fullscreen = false }) {
  return (
    <div className="absolute inset-0 z-10 flex w-full items-center justify-center">
      <Spin fullscreen={fullscreen} size="large" />
    </div>
  );
}
