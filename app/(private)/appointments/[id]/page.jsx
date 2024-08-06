"use client";

import "../../users/_components/customStyles.css";
import ApiKit from "@/common/ApiKit";
import Loading from "@/components/shared/Loading";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Button,
  Avatar,
  TimePicker,
  DatePicker,
  Modal,
  Breadcrumb,
  Tag,
} from "antd";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import moment from "moment";
import { useFormik } from "formik";
import { useState } from "react";
import Label from "@/components/shared/Label";
import { combineDateTime, formatText } from "@/lib/utils";
import { toast } from "sonner";

export default function AppointmentDetails() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const type = searchParams.get("type");

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

  const handelAcceptAppointment = (appointmentId) => {
    const promise = ApiKit.appointment
      .acceptAppointment(appointmentId)
      .then(() => {
        refetch();
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    toast.promise(promise, {
      loading: "Accepting appointment...",
      success: "Appointment accepted successfully",
      error: "Failed to accept appointment",
    });
  };

  const handelDeclineAppointment = (appointmentId) => {
    const promise = ApiKit.appointment
      .declineAppointment(appointmentId)
      .then(() => {
        refetch();
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });

    toast.promise(promise, {
      loading: "Declining appointment...",
      success: "Appointment declined successfully",
      error: "Failed to decline appointment",
    });
  };

  const formik = useFormik({
    initialValues: {
      date: "",
      time: "",
    },
    onSubmit: (values) => {
      if (!values.date || !values.time) {
        toast.error("Please select date and time");
        return;
      }

      setLoading(true);
      let payload = {
        dateTime: combineDateTime(values.date, values.time),
      };

      const promise = ApiKit.appointment
        .updateAppointment(appointment?._id, payload)
        .then(() => {
          refetch();
          setIsModalOpen(false);
          formik.resetForm();
        })
        .catch((error) => {
          console.log(error);
          throw error;
        })
        .finally(() => {
          setLoading(false);
        });

      toast.promise(promise, {
        loading: "Rescheduling appointment...",
        success: "Appointment rescheduled successfully",
        error: "Failed to reschedule appointment",
      });
    },
  });

  const {
    data: appointment,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointment", id],
    queryFn: () =>
      ApiKit.appointment
        .getAppointment(id)
        .then((res) => res.data?.appointment),
    enabled: !!id,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-5">
      <title>APPOINTEASE | APPOINTMENT DETAILS</title>
      <Breadcrumb
        items={[
          {
            title: <Link href="/appointments">Appointments</Link>,
          },
          {
            title: "Details",
          },
        ]}
      />
      <div>
        <h3 className="text-xl font-semibold md:text-3xl">
          Appointment Details
        </h3>
      </div>

      <Card className={"mt-8 w-full rounded-lg shadow"}>
        <div className="mb-2">
          <h2 className="mb-1 text-xl font-bold leading-none sm:line-clamp-1 lg:text-2xl xl:line-clamp-none">
            {appointment?.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <p>Created: {moment(appointment?.createdAt).format("LL")}</p>{" "}
            <Tag
              color={
                appointment?.status === "accepted"
                  ? "green"
                  : appointment?.status === "declined"
                    ? "red"
                    : "orange"
              }
            >
              {formatText(appointment?.status)}
            </Tag>
          </div>
        </div>

        <div>
          <div className="mb-4 space-y-4 sm:mb-4">
            <div className="flex items-center gap-2">
              <div>
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${appointment?.participant?.name}&background=random`}
                />
              </div>
              <div>
                <small className="text-gray-500 ">SCHEDULER</small>
                <h4 className="font-semibold leading-none text-gray-900">
                  {appointment?.participant?.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${appointment?.scheduler?.name}&background=random`}
                />
              </div>
              <div>
                <small className="text-gray-500 ">PARTICIPANT</small>
                <h4 className="font-semibold leading-none text-gray-900">
                  {appointment?.scheduler?.name}
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold leading-none text-gray-900">
            Description:
          </h4>
          <p className="mt-1 text-gray-500">
            {appointment?.description || "No description provided"}
          </p>
        </div>

        <div
          className={`mb-4 flex items-center rounded-lg ${appointment?.isDueDateExceeded ? "sm:bg-red-100" : "sm:bg-gray-100"} sm:p-4`}
        >
          <div className="max-sm:hidden">
            <Calendar
              className={`mr-2 size-10 overflow-visible rounded-full p-2 
          ${
            appointment?.isDueDateExceeded
              ? "bg-red-200 text-red-500"
              : "bg-blue-200 text-[#1890ff]"
          }
            `}
            />
          </div>
          <div>
            <small className="text-gray-500">DATE & TIME</small>
            <h4
              className={`${appointment?.isDueDateExceeded ? "text-red-500" : "text-gray-900"} text-sm font-semibold leading-none  sm:text-base`}
            >
              {moment(appointment?.dateTime).format("LLLL")}
            </h4>
          </div>
        </div>

        <div className="mb-4">
          {appointment?.audioMessage ? (
            <audio
              src={appointment?.audioMessage}
              controls
              className="w-full"
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 max-xs:flex-col">
          {type === "scheduler" ? (
            appointment?.status === "accepted" ? (
              <Button
                className="w-full !border !border-green-500 !bg-green-100 !text-green-500"
                disabled
              >
                Accepted
              </Button>
            ) : appointment?.status === "declined" ? (
              <Button
                danger
                className="w-full !border !border-red-500 !bg-red-100 !text-red-500"
                disabled
              >
                Declined
              </Button>
            ) : (
              <>
                <Button
                  type="primary"
                  className="w-full xs:w-1/2"
                  onClick={() => setIsModalOpen(true)}
                >
                  Reschedule
                </Button>
                <Button
                  type="primary"
                  className="w-full xs:w-1/2"
                  danger
                  onClick={() => handelCancelAppointment(appointment?._id)}
                >
                  Cancel
                </Button>
              </>
            )
          ) : appointment?.status === "accepted" ? (
            <Button
              className="w-full !border !border-green-500 !bg-green-100 !text-green-500"
              disabled
            >
              Accepted
            </Button>
          ) : appointment?.status === "declined" ? (
            <Button
              danger
              className="w-full !border !border-red-500 !bg-red-100 !text-red-500"
              disabled
            >
              Declined
            </Button>
          ) : (
            <>
              <Button
                type="primary"
                className="w-full xs:w-1/2"
                onClick={() => handelAcceptAppointment(appointment?._id)}
              >
                Accept
              </Button>
              <Button
                type="primary"
                className="w-full xs:w-1/2"
                danger
                onClick={() => handelDeclineAppointment(appointment?._id)}
              >
                Decline
              </Button>
            </>
          )}
        </div>
      </Card>

      <Modal
        title="Reschedule Appointment"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setLoading(false);
          formik.resetForm();
        }}
        centered
        footer={() => (
          <div>
            <Button
              type="primary"
              onClick={formik.handleSubmit}
              loading={loading}
            >
              Reschedule
            </Button>
          </div>
        )}
        maskClosable={false}
      >
        <form className="space-y-2">
          <div className="flex w-full flex-col gap-1">
            <Label required>Date</Label>
            <DatePicker
              value={
                formik.values.date
                  ? moment(formik.values.date, "YYYY-MM-DD")
                  : null
              }
              onChange={(_, dateString) => {
                console.log(dateString);
                formik.setFieldValue("date", dateString);
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-1">
            <Label required>Time</Label>
            <TimePicker
              value={
                formik.values.time ? moment(formik.values.time, "h:mm A") : null
              }
              use12Hours
              format="h:mm A"
              onChange={(_, timeString) => {
                formik.setFieldValue("time", timeString);
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
