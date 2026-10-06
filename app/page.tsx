import Image from "next/image";
import Link from "next/link";

import { PatientForm } from "@/components/forms/PatientForm";
import { PasskeyModal } from "@/components/PasskeyModal";

interface SearchParamProps {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

const Home = async ({ searchParams }: SearchParamProps) => {
  const params = await searchParams;
  const isAdmin = params?.admin === "true";

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {isAdmin && <PasskeyModal />}

      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="from-grey-800 absolute inset-0 bg-linear-to-br via-slate-950 to-slate-900" />
        <div className="bg-blue-500/3 absolute left-1/4 top-0 size-72 animate-pulse rounded-full blur-3xl md:size-96" />
        <div className="bg-emerald-500/3 absolute bottom-0 right-1/4 size-72 animate-pulse rounded-full blur-3xl delay-1000 md:size-96" />
      </div>

      {/* Main Content Section */}
      <section className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Logo Section */}
          <div className="mb-12 flex justify-center lg:justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
              <Image
                src="/assets/icons/logo-full.svg"
                height={1000}
                width={1000}
                alt="CarePluse"
                className="h-10 w-fit "
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 lg:mb-10">
            <h1 className="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              Get Started with DokiTap
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base">
              Schedule your healthcare appointment today.
            </p>
          </div>

          {/* Form Card */}
          <div className="relative mb-6 lg:mb-8">
            <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-blue-900/10 to-emerald-500/10 blur" />
            <div className="relative rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl sm:p-8">
              <PatientForm />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/50 pt-4 sm:flex-row sm:gap-0">
            <p className="order-2 text-xs text-slate-500 sm:order-1 sm:text-sm">
              © 2025 Dokitap
            </p>
            <Link
              href="/?admin=true"
              className="order-1 inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 sm:order-2"
              role="button"
              aria-label="Access admin panel"
            >
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Right Image Section - Hidden on mobile, visible on larger screens */}
      <div className="relative hidden w-full max-w-none overflow-hidden lg:flex lg:max-w-[45%] xl:max-w-[50%]">
        <div className="relative h-screen w-full">
          <Image
            src="/assets/images/onboarding.jpg"
            fill
            alt="Healthcare professional with patient"
            className="object-cover"
            sizes="(max-width: 1024px) 0vw, 50vw"
            priority
          />

          {/* Professional overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-slate-950/60 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />

          {/* Status indicator */}
          <div className="absolute right-6 top-6 rounded-xl border border-slate-700/50 bg-slate-900/80 p-3 shadow-lg backdrop-blur-md lg:right-8 lg:top-8 lg:p-4">
            <div className="flex items-center space-x-2">
              <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-sm font-medium text-white">Online</span>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-6 left-6 h-1 w-20 rounded-full bg-linear-to-r from-blue-500 to-emerald-500 opacity-60 lg:bottom-8 lg:left-8 lg:w-24" />
        </div>
      </div>
    </div>
  );
};

export default Home;
