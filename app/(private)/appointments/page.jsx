"use client";

import Label from "@/components/shared/Label";
import { generateQueryString, sanitizeParams } from "@/lib/utils";
import { Button, Input, Select, Tabs } from "antd";
import { Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const statusOptions = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Declined",
    value: "declined",
  },
];

const dateOptions = [
  {
    label: "Past",
    value: "past",
  },
  {
    label: "Upcoming",
    value: "upcoming",
  },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchKey, setSearchKey] = useState(searchParams.get("search") || "");
  const [params, setParams] = useState({
    type: "scheduler",
    search: "",
    status: "",
    date_filter: "",
    page: 1,
    limit: 10,
  });

  console.log(sanitizeParams(params));

  const debouncedSearch = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
    }));
  }, 400);

  const debouncedRouterPush = useDebouncedCallback((queryString) => {
    router.push(queryString || "/appointments");
  }, 400);

  useEffect(() => {
    const queryString = generateQueryString(params);
    debouncedRouterPush(queryString);
  }, [params, debouncedRouterPush]);

  const items = [
    {
      key: "scheduler",
      label: "Scheduler",
      children: "Content of Scheduler",
    },
    {
      key: "participant",
      label: "Participant",
      children: "Content of Participant",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex max-sm:flex-col sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold md:text-3xl">Appointments</h3>
        </div>
        <div>
          <Button type="primary" icon={<Plus className="size-5" />}>
            Book an Appointment
          </Button>
        </div>
      </div>

      <div>
        <div className="space-y-1">
          <Label>Search user</Label>
          <Input
            type="text"
            value={searchKey}
            placeholder="Search user by name or username"
            allowClear
            prefix={<Search className="size-4 opacity-50" />}
            onChange={(e) => {
              setSearchKey(e.target.value);
              debouncedSearch(e.target.value);
            }}
            onReset={() => {
              setParams((prevParams) => ({
                ...prevParams,
                search: "",
              }));
              setSearchKey("");
            }}
          />
        </div>

        <div className="space-y-1">
          <Label>Filter by status</Label>
          <Select
            allowClear
            placeholder="Select status"
            optionFilterProp="label"
            onChange={(value) => {
              setParams((prevParams) => ({
                ...prevParams,
                status: value,
              }));
            }}
            options={statusOptions}
            className="w-full"
          />
        </div>

        <div className="space-y-1">
          <Label>
            Filter by date
            <span className="text-xs text-gray-500"> (past / upcoming)</span>
          </Label>
          <Select
            allowClear
            placeholder="Select status"
            optionFilterProp="label"
            onChange={(value) => {
              setParams((prevParams) => ({
                ...prevParams,
                date_filter: value,
              }));
            }}
            options={dateOptions}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Tabs
          defaultActiveKey="scheduler"
          items={items}
          onChange={() =>
            setParams((prevParams) => ({
              ...prevParams,
              type:
                prevParams.type === "scheduler" ? "participant" : "scheduler",
            }))
          }
        />
      </div>
    </div>
  );
}
