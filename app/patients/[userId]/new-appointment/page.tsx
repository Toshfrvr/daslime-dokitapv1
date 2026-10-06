import Image from "next/image";

import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";

const Appointment = async ({ params: { userId } }: SearchParamProps) => {
  const patient = await getPatient(userId);

  return (
    <div className="flex h-screen max-h-screen  bg-slate-950">
      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[860px] flex-1 justify-between ">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="logo"
            className="mb-12 h-10 w-fit"
          />

          <AppointmentForm
            patientId={patient?.$id}
            userId={userId}
            type="create"
          />

          <p className="copyright mt-10 py-12">© 2025 Dokitap</p>
        </div>
      </section>

      
      <div className="relative max-w-[590px] overflow-hidden rounded-2xl">
  {/* The Image */}
  <Image
    src="/assets/images/medium-shot-doctor-walking-with-laptop.jpg"
    height={1000}
    width={1000}
    alt="patient"
    className="side-img h-auto w-full object-cover"
  />

  {/* Professional Overlay */}
  <div className="absolute inset-0 bg-linear-to-br from-slate-950/60 via-slate-950/20 to-transparent" />
  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
</div>

      
    </div>
  );
};

export default Appointment;
