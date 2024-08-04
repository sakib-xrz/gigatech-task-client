/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import ApiKit from "@/common/ApiKit";
import Label from "@/components/shared/Label";
import Loading from "@/components/shared/Loading";
import {
  combineDateTime,
  generateQueryString,
  sanitizeParams,
} from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  DatePicker,
  Input,
  Modal,
  Select,
  Table,
  TimePicker,
} from "antd";
const { TextArea } = Input;
const { Column } = Table;
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import format from "date-fns/format";
import { useFormik } from "formik";

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchKey, setSearchKey] = useState(searchParams.get("search") || "");
  const [params, setParams] = useState({
    search: searchParams.get("search") || "",
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      participant: "",
    },
    onSubmit: (values) => {
      const payload = {
        title: values.title,
        description: values.description,
        dateTime: combineDateTime(values.date, values.time),
        participant: values.participant,
      };
      console.log(payload);
    },
  });

  const debouncedSearch = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
    }));
  }, 400);

  const debouncedRouterPush = useDebouncedCallback((queryString) => {
    router.push(queryString || "/users");
  }, 400);

  useEffect(() => {
    const queryString = generateQueryString(params);
    debouncedRouterPush(queryString);
  }, [params, debouncedRouterPush]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      ApiKit.user.getUsers(sanitizeParams(params)).then((res) => res),
  });

  useEffect(() => {
    refetch();
  }, [params]);

  if (isLoading) {
    return <Loading />;
  }

  const count = data?.meta?.count;
  const users = data?.data?.users;

  const dataSource = users?.map((user) => ({
    key: user?._id,
    name: user.name,
    username: user.username,
    createdAt: user.createdAt,
  }));

  const options = users?.map((user) => ({
    label: user.name,
    value: user._id,
  }));

  return (
    <div className="space-y-5">
      <div className="flex max-sm:flex-col sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold md:text-3xl">Users</h3>
        </div>
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
      </div>

      <p className=" text-sm">
        {count} {count > 1 ? "users" : "user"} found
      </p>

      <div>
        <Table dataSource={dataSource} bordered pagination={false}>
          <Column
            title="Users"
            key="name"
            render={(_, record) => (
              <React.Fragment>
                <div className="flex items-center">
                  <Avatar
                    size="large"
                    src={`https://ui-avatars.com/api/?name=${record.name}&background=random`}
                  />
                  <div className="ml-2">
                    <p className="font-semibold">{record.name}</p>
                    <p className="text-sm">{record.username}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="max-xs:w-full">
                    Schedule an Appointment
                  </Button>
                </div>
              </React.Fragment>
            )}
            responsive={["xs"]}
          />
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            render={(name) => (
              <>
                <Avatar
                  size="small"
                  src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                />
                <span className="ml-2 font-semibold">{name}</span>
              </>
            )}
            responsive={["sm"]}
          />
          <Column
            title="Username"
            dataIndex="username"
            key="username"
            responsive={["md"]}
          />
          <Column
            title="Joining Date"
            dataIndex="createdAt"
            key="createdAt"
            render={(createdAt) => <>{format(createdAt, "PP")}</>}
            responsive={["lg"]}
          />
          <Column
            title={() => <p className="text-center">Action</p>}
            key="action"
            render={(_, record) => (
              <div className="text-center">
                <Button onClick={() => setIsModalOpen(true)}>
                  Schedule an Appointment
                </Button>
              </div>
            )}
            responsive={["sm"]}
          />
        </Table>
      </div>

      <Modal
        title="Schedule an Appointment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        footer={() => (
          <div>
            <Button type="primary" onClick={formik.handleSubmit}>
              Schedule Appointment
            </Button>
          </div>
        )}
        maskClosable={false}
      >
        <form className="space-y-2">
          <div className="space-y-1">
            <Label required>Appointment Title</Label>
            <Input
              type="text"
              name="title"
              {...formik.getFieldProps("title")}
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <TextArea
              name="description"
              {...formik.getFieldProps("description")}
              rows={4}
            />
          </div>

          <div className="flex max-md:flex-col md:items-center md:gap-5">
            <div className="flex w-full flex-col gap-1">
              <Label required>Date</Label>
              <DatePicker
                onChange={(_, dateString) => {
                  formik.setFieldValue("date", dateString);
                }}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label required>Time</Label>
              <TimePicker
                use12Hours
                format="h:mm a"
                onChange={(_, timeString) => {
                  formik.setFieldValue("time", timeString);
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label required>Participant</Label>
            <Select
              showSearch
              allowClear
              placeholder="Select a participant"
              optionFilterProp="label"
              onChange={(value) => {
                formik.setFieldValue("participant", value);
              }}
              options={options}
              className="w-full"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
