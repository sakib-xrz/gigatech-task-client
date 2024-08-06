"use client";

import useStore from "@/store";
import { Avatar, Dropdown } from "antd";
import { UserRound } from "lucide-react";
import { NAV_OPTIONS as items } from "@/lib/keyChain";
import { usePathname } from "next/navigation";

export default function UserProfile() {
  const pathname = usePathname();
  const { user } = useStore();

  const selectedKey =
    pathname === "/users" ? "0" : pathname === "/appointments" ? "1" : "";

  return (
    <Dropdown menu={{ items, selectable: true, selectedKeys: [selectedKey] }}>
      <div
        className="m-2 flex cursor-pointer items-center gap-2 rounded-md border p-2"
        onClick={(e) => e.preventDefault()}
      >
        <Avatar icon={<UserRound />} />
        <div className="pr-2">
          <p className="text-start text-xs font-semibold text-gray-700">
            {user?.name}
          </p>
          <p className="text-start text-xs font-medium text-gray-500">
            {user?.username}
          </p>
        </div>
      </div>
    </Dropdown>
  );
}
