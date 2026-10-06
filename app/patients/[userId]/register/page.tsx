import Image from "next/image";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/forms/RegisterForm";
import { getPatient, getUser } from "@/lib/actions/patient.actions";

const Register = async ({ params: { userId } }: SearchParamProps) => {
  const user = await getUser(userId);
  const patient = await getPatient(userId);

  if (patient) redirect(`/patients/${userId}/new-appointment`);

  return (
    <div className="flex h-screen max-h-screen  bg-slate-950">
      <section className="remove-scrollbar container">
        
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />

          <RegisterForm user={user} />

          
        </div>
      </section>

      <div className="relative max-w-[590px] overflow-hidden rounded-2xl">
  {/* The Image */}
  <Image
    src="/assets/images/register.jpg"
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

export default Register;
