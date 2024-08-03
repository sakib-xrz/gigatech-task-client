"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Avatar, Drawer, Menu as AntdMenu, Button } from "antd";
import {
  CalendarDays,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import useStore from "@/store";
import UserProfile from "./UserProfile";
import logo from "@/public/image/logo.png";

const { Item } = AntdMenu;

export default function Navbar() {
  const { user } = useStore();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const selectedKey = pathname === "/appointments" ? "1" : "0";

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="border-border sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-2">
        <Link href={"/users"} className="h-14">
          <Image
            src={logo}
            alt="AppointEase Logo"
            quality={100}
            className="aspect-auto h-full w-auto object-cover"
            loading="eager"
          />
        </Link>
        <div className="hidden sm:block">
          <UserProfile />
        </div>
        <div className="sm:hidden">
          <Menu className="size-8" onClick={showDrawer} />
        </div>
      </div>

      <Drawer
        title={
          <div className="flex w-fit cursor-pointer items-center gap-2 rounded-md border p-2">
            <Avatar icon={<UserRound />} size={"small"} />
            <div className="pr-2">
              <p className="text-start text-xs font-semibold text-gray-700">
                {user?.name}
              </p>
              <p className="text-start text-xs font-medium text-gray-500">
                {user?.username}
              </p>
            </div>
          </div>
        }
        placement={"right"}
        closable={false}
        open={open}
        key={"right"}
        extra={<X className="size-8" onClick={onClose} />}
        bodyStyle={{ padding: 0 }}
      >
        <div>
          <AntdMenu
            mode="vertical"
            style={{ width: "100%" }}
            selectable
            selectedKeys={[selectedKey]}
          >
            <Item key={"0"}>
              <Link href="/users" className="flex items-center gap-2">
                <UsersRound className="size-5" /> Users
              </Link>
            </Item>
            <Item key={"1"}>
              <Link href="/appointments" className="flex items-center gap-2">
                <CalendarDays className="size-5" /> Appointments
              </Link>
            </Item>
          </AntdMenu>

          <Link href="/logout" className="absolute bottom-6 right-6">
            <Button danger type="primary" className="flex items-center gap-2">
              <LogOut className="size-5" /> Logout
            </Button>
          </Link>
        </div>
      </Drawer>
    </div>
  );
}
