import ApiKit from "@/common/ApiKit";
import { Card, Button, Avatar, TimePicker, DatePicker, Modal } from "antd";
import { useFormik } from "formik";
import { Calendar } from "lucide-react";
import moment from "moment";
import { toast } from "sonner";
import { useState } from "react";
import Label from "@/components/shared/Label";
import { combineDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AppointmentCard({ appointment, type, refetch }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <>
      <Card
        onClick={() => router.push(`/appointments/${appointment?._id}`)}
        className={`mt-8 w-full cursor-pointer rounded-lg !border shadow
      ${appointment.status === "accepted" ? "!border-green-500 !bg-green-50" : appointment.status === "declined" ? "!border-red-500 !bg-red-50" : "!border-gray-300"}
    `}
      >
        <h2 className="mb-2 text-xl font-bold sm:line-clamp-1 lg:text-2xl xl:line-clamp-none">
          {appointment?.title}
        </h2>

        <div>
          <div className="mb-2 sm:mb-4">
            {type === "scheduler" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="max-sm:hidden">
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${appointment?.participant?.name}&background=random`}
                    />
                  </div>
                  <div>
                    <small className="text-gray-500 ">APPOINTMENT WITH</small>
                    <h4 className="font-semibold leading-none text-gray-900">
                      {appointment?.participant?.name}
                    </h4>
                  </div>
                </div>
              </>
            ) : (
              <h4 className="text-sm font-semibold text-gray-900">
                <>
                  <div className="flex items-center gap-2">
                    <div className="max-sm:hidden">
                      <Avatar
                        src={`https://ui-avatars.com/api/?name=${appointment?.scheduler?.name}&background=random`}
                      />
                    </div>
                    <div>
                      <small className="text-gray-500 ">APPOINTMENT WITH</small>
                      <h4 className="font-semibold leading-none text-gray-900">
                        {appointment?.scheduler?.name}
                      </h4>
                    </div>
                  </div>
                </>
              </h4>
            )}
          </div>
        </div>

        <div
          className={`mb-4 flex items-center rounded-lg ${appointment?.isDueDateExceeded ? "sm:bg-red-100" : appointment?.status === "accepted" ? "sm:bg-green-100" : appointment?.status === "declined" ? "sm:bg-red-100" : "sm:bg-gray-100"} sm:p-4`}
        >
          <div className="max-sm:hidden">
            <Calendar
              className={`mr-2 size-10 overflow-visible rounded-full p-2 
          ${
            appointment?.isDueDateExceeded
              ? "bg-red-200 text-red-500"
              : appointment?.status === "accepted"
                ? "bg-green-200 text-green-500"
                : appointment?.status === "declined"
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
    </>
  );
}
