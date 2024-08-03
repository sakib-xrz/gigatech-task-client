import Link from "next/link";
import { CalendarDays, LogOut, UsersRound } from "lucide-react";

export const AUTH_TOKEN_KEY = "@AUTH_TOKEN";

export const NAV_OPTIONS = [
  {
    label: (
      <Link href="/users" className="flex items-center gap-2">
        <UsersRound className="size-5" /> Users
      </Link>
    ),
    key: "0",
  },
  {
    label: (
      <Link href="/appointments" className="flex items-center gap-2">
        <CalendarDays className="size-5" /> Appointments
      </Link>
    ),
    key: "1",
  },
  {
    type: "divider",
  },
  {
    label: (
      <Link href="/logout" className="flex items-center gap-2">
        <LogOut className="size-5" /> Logout
      </Link>
    ),
    danger: true,
    key: "2",
  },
];
