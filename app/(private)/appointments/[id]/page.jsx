"use client";

import { Breadcrumb } from "antd";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AppointmentDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-5">
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
    </div>
  );
}
