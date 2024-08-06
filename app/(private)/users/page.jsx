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
import { useFormik } from "formik";
import SendVoice from "./_components/SendVoice";
import { uploadAudio } from "@/lib/uploadAudio";
import { toast } from "sonner";
import moment from "moment";
import useStore from "@/store";

export default function UsersPage() {
  const { user } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [blob, setBlob] = useState(null);
  const [searchKey, setSearchKey] = useState(searchParams.get("search") || "");
  const [params, setParams] = useState({
    search: searchParams.get("search") || "",
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

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      participant: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      let payload = {
        title: values.title,
        description: values.description,
        dateTime: combineDateTime(values.date, values.time),
        participant: values.participant,
      };
      if (blob) {
        const audioMessage = await uploadAudio(blob);
        payload = {
          ...payload,
          audioMessage,
        };

        await ApiKit.appointment
          .createAppointment(payload)
          .then(() => {
            setIsModalOpen(false);
            setBlob(null);
            refetch();
            toast.success("Appointment scheduled successfully");
          })
          .catch(() => {
            toast.error("Failed to schedule an appointment");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        payload = {
          ...payload,
          audioMessage: "",
        };

        await ApiKit.appointment
          .createAppointment(payload)
          .then(() => {
            setIsModalOpen(false);
            refetch();
            toast.success("Appointment scheduled successfully");
          })
          .catch(() => {
            toast.error("Failed to schedule an appointment");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
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
    hasPendingAppointment: user.hasPendingAppointment,
    scheduler: user.scheduler,
    appointmentId: user.appointmentId,
  }));

  const handelCancelAppointment = (appointmentId) => {
    const promise = ApiKit.appointment
      .cancelAppointment(appointmentId)
      .then(() => {
        refetch();
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    toast.promise(promise, {
      loading: "Cancelling appointment...",
      success: "Appointment cancelled successfully",
      error: "Failed to cancel appointment",
    });
  };

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

      <p className="text-sm">
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

                <div>
                  <p className="mt-2 text-sm">
                    Joined on {moment(record.createdAt).format("LL")}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="text-center">
                    {!record?.hasPendingAppointment ? (
                      <div className="flex items-center justify-center gap-2 xs:justify-start sm:justify-center">
                        <Button
                          size="small"
                          className="max-xs:w-full"
                          onClick={() => {
                            setIsModalOpen(true);
                            formik.setFieldValue("participant", record.key);
                          }}
                        >
                          Schedule an Appointment
                        </Button>
                      </div>
                    ) : record?.scheduler === user._id ? (
                      <div className="flex items-center justify-center gap-2 xs:justify-start sm:justify-center">
                        <Button
                          size="small"
                          className="max-xs:w-full"
                          danger
                          onClick={() =>
                            handelCancelAppointment(record?.appointmentId)
                          }
                        >
                          Cancel Appointment
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 xs:justify-start sm:justify-center">
                        <Button
                          size="small"
                          type="primary"
                          className="max-xs:w-full"
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          danger
                          className="max-xs:w-full"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
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
            render={(createdAt) => <>{moment(createdAt).format("LL")}</>}
            responsive={["lg"]}
          />
          <Column
            title={() => <p className="text-center">Action</p>}
            key="action"
            render={(_, record) => {
              return (
                <div className="text-center">
                  {!record?.hasPendingAppointment ? (
                    <Button
                      onClick={() => {
                        setIsModalOpen(true);
                        formik.setFieldValue("participant", record.key);
                      }}
                    >
                      Schedule an Appointment
                    </Button>
                  ) : record?.scheduler === user._id ? (
                    <Button
                      danger
                      onClick={() =>
                        handelCancelAppointment(record?.appointmentId)
                      }
                    >
                      Cancel Appointment
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Button type="primary">Accept</Button>
                      <Button type="primary" danger>
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              );
            }}
            responsive={["sm"]}
          />
        </Table>
      </div>

      <Modal
        title="Schedule an Appointment"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setLoading(false);
          formik.resetForm();
          setUrl("");
          setBlob(null);
        }}
        centered
        footer={() => (
          <div>
            <Button
              type="primary"
              onClick={formik.handleSubmit}
              loading={loading}
            >
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

          <div className="flex gap-2 max-md:flex-col md:items-center md:gap-5">
            <div className="flex w-full flex-col gap-1">
              <Label required>Date</Label>
              <DatePicker
                value={
                  formik.values.date
                    ? moment(formik.values.date, "YYYY-MM-DD")
                    : null
                }
                onChange={(_, dateString) => {
                  formik.setFieldValue("date", dateString);
                }}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <Label required>Time</Label>
              <TimePicker
                value={
                  formik.values.time
                    ? moment(formik.values.time, "h:mm A")
                    : null
                }
                use12Hours
                format="h:mm A"
                onChange={(_, timeString) => {
                  formik.setFieldValue("time", timeString);
                }}
              />
            </div>
          </div>

          {/* <div className="space-y-1">
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
          </div> */}

          <SendVoice setBlob={setBlob} url={url} setUrl={setUrl} />
        </form>
      </Modal>
    </div>
  );
}
