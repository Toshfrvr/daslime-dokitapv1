"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelectItem } from "@/components/ui/select";
import { Doctors } from "@/constants";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
    }

    try {
      if (type === "create" && patientId) {
        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as Status,
          note: values.note,
        };

        const newAppointment = await createAppointment(appointment);

        if (newAppointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;
    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      buttonLabel = "Submit Appointment";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4">
        {type === "create" && (
          <section className="mb-6 space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl border border-emerald-500/30 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-transparent">
                  New Appointment
                </h1>
                <div className="h-0.5 w-12 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-slate-400 text-sm ml-12">
              Schedule your appointment in seconds.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            {/* Doctor Selection */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="relative z-20">
                  <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="primaryPhysician"
                    label="Doctor"
                    placeholder="Select a doctor"
                  >
                    {Doctors.map((doctor, i) => (
                      <SelectItem key={doctor.name + i} value={doctor.name}>
                        <div className="flex cursor-pointer items-center gap-2.5 py-1">
                          <div className="relative">
                            <Image
                              src={doctor.image}
                              width={28}
                              height={28}
                              alt="doctor"
                              className="rounded-full border border-slate-600 shadow-sm"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-800"></div>
                          </div>
                          <p className="text-sm font-medium text-slate-200">{doctor.name}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </CustomFormField>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 z-30">
                <CustomFormField
                  fieldType={FormFieldType.DATE_PICKER}
                  control={form.control}
                  name="schedule"
                  label="Expected appointment date"
                  showTimeSelect
                  dateFormat="MM/dd/yyyy  -  h:mm aa"
                />
              </div>
            </div>

            {/* Reason and Notes - Responsive Grid */}
            <div className={`grid gap-3 ${type === "create" ? "xl:grid-cols-2" : "grid-cols-1"}`}>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-green-500/5 to-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="reason"
                    label="Appointment reason"
                    placeholder="Annual monthly check-up"
                    disabled={type === "schedule"}
                  />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-amber-500/5 to-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 hover:border-blue-700/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-700/10">
                  <CustomFormField
                    fieldType={FormFieldType.TEXTAREA}
                    control={form.control}
                    name="note"
                    label="Comments/notes"
                    placeholder="Prefer afternoon appointments, if possible"
                    disabled={type === "schedule"}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {type === "cancel" && (
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-red-500/5 to-rose-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3 hover:border-red-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="cancellationReason"
                label="Reason for cancellation"
                placeholder="Urgent meeting came up"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <SubmitButton
            isLoading={isLoading}
            className={`${
              type === "cancel" 
                ? "bg-linear-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/30" 
                : "bg-linear-to-r from-emerald-500/90 to-green-600/90 hover:from-emerald-500 hover:to-green-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            } w-full backdrop-blur-xl border border-emerald-500/30 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5`}
          >
            {buttonLabel}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};