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
  Button,
  DatePicker,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Tabs,
  TimePicker,
} from "antd";
const { TextArea } = Input;
import { Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import AppointmentCard from "./components/AppointmentCard";
import SendVoice from "../users/_components/SendVoice";
import { useFormik } from "formik";
import moment from "moment";
import { toast } from "sonner";

const statusOptions = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Accepted",
    value: "accepted",
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

const items = [
  {
    key: "scheduler",
    label: "Scheduler",
  },
  {
    key: "participant",
    label: "Participant",
  },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchKey, setSearchKey] = useState(searchParams.get("search") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [blob, setBlob] = useState(null);
  const [params, setParams] = useState({
    type: "scheduler",
    search: "",
    status: "",
    date_filter: "",
    page: 1,
    limit: 10,
  });

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["appointments"],
    queryFn: () =>
      ApiKit.appointment
        .getAppointments(sanitizeParams(params))
        .then((res) => res),
  });

  const { data: userData, isLoading: userIsLoading } = useQuery({
    queryKey: ["appointment", "users"],
    queryFn: () => ApiKit.user.getUsers().then((res) => res),
  });

  useEffect(() => {
    refetch();
  }, [params]);

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
            refetch();
            setParams((prevParams) => ({
              ...prevParams,
              type: "scheduler",
            }));
            router.push("/appointments?type=scheduler&page=1&limit=10");
            toast.success("Appointment scheduled successfully");
            formik.resetForm();
            formik.setFieldValue("participant", undefined);
            setIsModalOpen(false);
            setBlob(null);
          })
          .catch((err) => {
            toast.error(err.message || "Failed to schedule an appointment");
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
            refetch();
            toast.success("Appointment scheduled successfully");
            setParams((prevParams) => ({
              ...prevParams,
              type: "scheduler",
            }));
            router.push("/appointments?type=scheduler&page=1&limit=10");
            formik.resetForm();
            formik.setFieldValue("participant", undefined);
            setIsModalOpen(false);
          })
          .catch((err) => {
            toast.error(err.message || "Failed to schedule an appointment");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
  });

  if (isLoading || userIsLoading) {
    return <Loading />;
  }

  const appointments = data?.data?.appointments || [];
  const meta = data?.meta || {};
  const users = userData?.data?.users;

  const userOptions = users?.map((user) => ({
    label: user.name,
    value: user._id,
  }));

  return (
    <div className="space-y-5">
      <div className="flex gap-5 max-xs:flex-col xs:items-center xs:justify-between">
        <div>
          <h3 className="text-xl font-semibold md:text-3xl">Appointments</h3>
        </div>
        <div>
          <Button
            type="primary"
            className="max-xs:w-full"
            icon={<Plus className="size-5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Book an Appointment
          </Button>
        </div>
      </div>

      <div className="flex gap-3 max-md:flex-col md:items-center">
        <div className="w-full space-y-1 md:w-6/12">
          <Label>Search appointment</Label>
          <Input
            type="text"
            value={searchKey}
            placeholder="Search by appointment name"
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

        <div className="flex w-full items-center gap-3 md:w-6/12">
          <div className="w-full space-y-1">
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

          <div className="w-full space-y-1">
            <Label>Past / Upcoming</Label>
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
      </div>

      <p className="text-sm">
        {meta?.count > 0
          ? `${meta?.count} ${
              meta?.count > 1 ? "appointments" : "appointment"
            } found`
          : "No appointments found"}
      </p>

      <div>
        <Tabs
          defaultActiveKey="scheduler"
          activeKey={params.type}
          items={items}
          onChange={(key) =>
            setParams((prevParams) => ({
              ...prevParams,
              type: key,
            }))
          }
        />

        <div>
          {appointments?.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  type={params.type}
                  refetch={refetch}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No appointments found"
              />
            </div>
          )}

          <Modal
            title="Schedule an Appointment"
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setLoading(false);
              formik.resetForm();
              formik.setFieldValue("participant", undefined);
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

              <div className="space-y-1">
                <Label required>Participant</Label>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select a participant"
                  optionFilterProp="label"
                  value={formik.values.participant}
                  onChange={(value) => {
                    formik.setFieldValue("participant", value);
                  }}
                  options={userOptions}
                  className="w-full"
                />
              </div>

              <SendVoice setBlob={setBlob} url={url} setUrl={setUrl} />
            </form>
          </Modal>
        </div>

        <div>
          {meta?.total > 10 && (
            <Pagination
              align="center"
              total={meta?.total}
              current={params?.page}
              pageSize={params?.limit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
