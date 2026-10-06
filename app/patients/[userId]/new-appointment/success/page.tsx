"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { getAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchParamProps {
  searchParams?: { [key: string]: string | string[] | undefined };
  params: { userId: string };
}

const RequestSuccess = ({
  searchParams,
  params: { userId },
}: SearchParamProps) => {
  const appointmentId = (searchParams?.appointmentId as string) || "";
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const appointmentData = await getAppointment(appointmentId);
        setAppointment(appointmentData);
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  // Real-time updates
  // useEffect(() => {
  //   if (!appointment) return;

  //   const interval = setInterval(async () => {
  //     try {
  //       const updatedAppointment = await getAppointment(appointmentId);
  //       if (updatedAppointment.status !== appointment.status) {
  //         setAppointment(updatedAppointment);
  //       }
  //     } catch (error) {
  //       console.error("Error updating appointment:", error);
  //     }
  //   }, 30000); // Check every 30 seconds

  //   return () => clearInterval(interval);
  // }, [appointment, appointmentId]);

  // Countdown timer for scheduled appointments
  useEffect(() => {
    if (!appointment || appointment.status !== 'scheduled') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const appointmentTime = new Date(appointment.schedule).getTime();
      const distance = appointmentTime - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Now");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appointment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading your appointment...</p>
        </motion.div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-white">Appointment Not Found</h1>
          <p className="text-slate-400">We could not find your appointment details.</p>
          <Button asChild className="mt-4">
            <Link href="/">Back to Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const doctor = Doctors.find(
    (doctor) => doctor.name === appointment.primaryPhysician
  );

  // Status configuration with enhanced animations
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return {
          color: 'from-green-500 to-emerald-600',
          textColor: 'text-green-400',
          borderColor: 'border-green-500/30',
          bgAccent: 'bg-green-500/10',
          icon: (
            <motion.svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
            >
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.svg>
          ),
          title: 'Appointment Confirmed!',
          subtitle: 'Your appointment has been scheduled and confirmed by the doctor.',
          mainAction: 'View Appointment',
          secondaryAction: 'Reschedule'
        };
      case 'cancelled':
        return {
          color: 'from-red-500 to-rose-600',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/30',
          bgAccent: 'bg-red-500/10',
          icon: (
            <motion.svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <motion.path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </motion.svg>
          ),
          title: 'Appointment Cancelled',
          subtitle: 'Your appointment has been cancelled. You can schedule a new one anytime.',
          mainAction: 'Schedule New Appointment',
          secondaryAction: 'Contact Support'
        };
      default: // 'pending'
        return {
          color: 'from-blue-500 to-cyan-600',
          textColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          bgAccent: 'bg-blue-500/10',
          icon: (
            <motion.svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          ),
          title: 'Request Submitted!',
          subtitle: 'Your appointment request has been successfully submitted. We\'ll contact you shortly to confirm the details.',
          mainAction: 'Schedule Another Appointment',
          secondaryAction: 'Back to Home'
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  // Timeline steps based on status
  const getTimelineSteps = (status: string) => {
    const baseSteps = [
      {
        id: 1,
        title: 'Request submitted',
        description: 'Your appointment request was received',
        completed: true,
        current: false
      }
    ];

    switch (status.toLowerCase()) {
      case 'scheduled':
        return [
          ...baseSteps,
          {
            id: 2,
            title: 'Doctor reviewed',
            description: 'Request reviewed and approved',
            completed: true,
            current: false
          },
          {
            id: 3,
            title: 'Appointment confirmed',
            description: 'Your appointment is scheduled',
            completed: true,
            current: true
          }
        ];
      case 'cancelled':
        return [
          ...baseSteps,
          {
            id: 2,
            title: 'Appointment cancelled',
            description: 'Request was cancelled',
            completed: true,
            current: true,
            cancelled: true
          }
        ];
      default: // 'pending'
        return [
          ...baseSteps,
          {
            id: 2,
            title: 'Awaiting confirmation',
            description: 'Doctor will review your request',
            completed: false,
            current: true
          },
          {
            id: 3,
            title: 'Appointment scheduled',
            description: 'You\'ll receive confirmation',
            completed: false,
            current: false
          }
        ];
    }
  };

  const timelineSteps = getTimelineSteps(appointment.status);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className={`absolute -top-4 -right-4 w-48 h-48 sm:w-72 sm:h-72 bg-linear-to-br ${statusConfig.color} opacity-10 rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className={`absolute top-1/2 -left-8 w-64 h-64 sm:w-96 sm:h-96 bg-linear-to-br ${statusConfig.color} opacity-5 rounded-full blur-3xl`}
          animate={{
            scale: [1, 0.8, 1],
            x: [0, 20, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className={`absolute bottom-0 right-1/3 w-40 h-40 sm:w-64 sm:h-64 bg-linear-to-br ${statusConfig.color} opacity-10 rounded-full blur-3xl`}
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -30, 0],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Medical-themed background image */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/assets/images/onboarding.jpg"
            alt="Medical background"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 p-4 sm:p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/" className="inline-block group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/assets/icons/logo-full.svg"
              height={1000}
              width={1000}
              alt="CarePluse Logo"
              className="h-8 sm:h-10 w-fit"
            />
          </motion.div>
        </Link>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Status Section */}
        <motion.div className="text-center mb-8 sm:mb-12" variants={itemVariants}>
          {/* Status Animation */}
          <motion.div 
            className="relative inline-block mb-6 sm:mb-8"
            variants={floatingVariants}
            animate="animate"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
              <motion.div 
                className={`absolute inset-0 bg-linear-to-br ${statusConfig.color} rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className={`absolute inset-1 sm:inset-2 bg-linear-to-br ${statusConfig.color} rounded-full flex items-center justify-center shadow-2xl`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "backOut", delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {statusConfig.icon}
              </motion.div>
            </div>
          </motion.div>

          {/* Status Message */}
          <motion.div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12" variants={itemVariants}>
            <motion.h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.span 
                className={`bg-linear-to-r ${statusConfig.color} bg-clip-text text-transparent`}
                animate={{ 
                  backgroundPositionX: ["0%", "100%", "0%"] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {statusConfig.title.split(' ')[0]}
              </motion.span>{' '}
              {statusConfig.title.split(' ').slice(1).join(' ')}
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {statusConfig.subtitle}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Appointment Details Card */}
        <motion.div 
          className="max-w-4xl mx-auto mb-8 sm:mb-12"
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div 
              className={`bg-linear-to-r ${statusConfig.color} p-4 sm:p-6`}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
                  <motion.svg 
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </motion.svg>
                  <span className="truncate">Appointment Details</span>
                </h2>
                <motion.span 
                  className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full self-start sm:self-auto ${
                    appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </motion.span>
              </div>
            </motion.div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              {/* Countdown timer for scheduled appointments */}
              <AnimatePresence>
                {appointment.status === 'scheduled' && timeLeft && (
                  <motion.div
                    className="bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <motion.svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </motion.svg>
                      <h4 className="font-semibold text-green-400 text-sm sm:text-base">Time Until Appointment</h4>
                    </div>
                    <motion.p 
                      className="text-lg sm:text-xl font-bold text-green-300"
                      key={timeLeft}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {timeLeft}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Doctor Info */}
              <motion.div 
                className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border ${statusConfig.borderColor}`}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={doctor?.image!}
                      alt="doctor"
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl object-cover shadow-lg"
                    />
                  </motion.div>
                  <motion.div 
                    className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-slate-900 ${
                      appointment.status === 'scheduled' ? 'bg-green-500' :
                      appointment.status === 'cancelled' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">Primary Physician</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Dr. {doctor?.name}</p>
                </div>
              </motion.div>

              {/* Date & Time */}
              <motion.div 
                className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border ${statusConfig.borderColor}`}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br ${statusConfig.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shrink-0`}
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    {appointment.status === 'scheduled' ? 'Confirmed Date & Time' : 
                     appointment.status === 'cancelled' ? 'Original Date & Time' : 
                     'Requested Date & Time'}
                  </p>
                  <p className={`text-base sm:text-lg md:text-xl font-bold wrap-break-word ${
                    appointment.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-white'
                  }`}>
                    {formatDateTime(appointment.schedule).dateTime}
                  </p>
                </div>
              </motion.div>

              {/* Additional Info for Scheduled Appointments */}
              <AnimatePresence>
                {appointment.status === 'scheduled' && (
                  <motion.div 
                    className="bg-green-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <motion.svg 
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </motion.svg>
                      <h4 className="font-semibold text-green-400 text-sm sm:text-base">Important Reminders</h4>
                    </div>
                    <motion.ul 
                      className="text-xs sm:text-sm text-green-300 space-y-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.7 }}
                    >
                      <li>• Please arrive 15 minutes early</li>
                      <li>• Bring a valid ID and insurance card</li>
                      <li>• You'll receive a confirmation email shortly</li>
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cancellation reason */}
              <AnimatePresence>
                {appointment.status === 'cancelled' && appointment.cancellationReason && (
                  <motion.div 
                    className="bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <motion.svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </motion.svg>
                    <h4 className="font-semibold text-red-400 text-sm sm:text-base">Cancellation Reason</h4>
                  </div>
                  <motion.p 
                    className="text-xs sm:text-sm text-red-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  >
                    {appointment.cancellationReason}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-16 px-4"
        variants={itemVariants}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto"
        >
          <Button 
            asChild 
            className={`w-full sm:w-auto bg-linear-to-r ${statusConfig.color} hover:shadow-2xl text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg shadow-xl border-0 relative overflow-hidden group`}
          >
            <Link href={
              appointment.status === 'scheduled' ? `/patients/${userId}/appointments/${appointmentId}` : 
              `/patients/${userId}/new-appointment`
            }>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.svg 
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
              <span className="truncate relative z-10">{statusConfig.mainAction}</span>
            </Link>
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto"
        >
          <Button 
            variant="outline" 
            asChild 
            className={`w-full sm:w-auto border-2 ${statusConfig.borderColor} hover:border-opacity-80 ${statusConfig.textColor} hover:bg-slate-800/50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg bg-slate-800/30 backdrop-blur-sm transition-all duration-200 relative overflow-hidden group`}
          >
            <Link href={
              appointment.status === 'cancelled' ? '/contact' : '/'
            }>
              <motion.div
                className={`absolute inset-0 bg-linear-to-r ${statusConfig.color} opacity-10`}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.svg 
                className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0 relative z-10" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {appointment.status === 'cancelled' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                )}
              </motion.svg>
              <span className="truncate relative z-10">{statusConfig.secondaryAction}</span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Dynamic Status Timeline */}
      <motion.div className="max-w-2xl mx-auto px-4" variants={itemVariants}>
        <motion.div 
          className="bg-slate-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.h3 
            className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            {appointment.status === 'scheduled' ? 'Appointment Confirmed!' :
             appointment.status === 'cancelled' ? 'Request Timeline' :
             'What\'s Next?'}
          </motion.h3>
          <div className="space-y-4 sm:space-y-6">
            {timelineSteps.map((step, index) => (
              <motion.div 
                key={step.id} 
                className="flex items-start space-x-3 sm:space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 2.2 + index * 0.2 }}
              >
                <div className="flex flex-col items-center shrink-0">
                  <motion.div 
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      step.cancelled ? 'bg-red-500' :
                      step.completed ? 'bg-green-500' : 
                      step.current ? `bg-linear-to-r ${statusConfig.color}` : 
                      'bg-slate-600'
                    }`}
                    animate={step.current && !step.completed ? { 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                        "0 0 0 0 rgba(59, 130, 246, 0)"
                      ]
                    } : {}}
                    transition={step.current && !step.completed ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.cancelled ? (
                      <motion.svg 
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 2.4 + index * 0.2 }}
                      >
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </motion.svg>
                    ) : step.completed ? (
                      <motion.svg 
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 2.4 + index * 0.2 }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    ) : (
                      <motion.div 
                        className="h-2 w-2 rounded-full bg-white sm:h-3 sm:w-3"
                        animate={step.current ? { 
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1]
                        } : {}}
                        transition={step.current ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : {}}
                      />
                    )}
                  </motion.div>
                  {index < timelineSteps.length - 1 && (
                    <motion.div 
                      className={`mt-2 h-6 w-0.5 sm:h-8 ${
                        step.completed || step.cancelled ? 'bg-slate-600' : 'bg-slate-700'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: "2rem" }}
                      transition={{ duration: 0.6, delay: 2.6 + index * 0.2 }}
                    />
                  )}
                </div>
                <motion.div 
                  className="min-w-0 flex-1 pb-2 sm:pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2.8 + index * 0.2 }}
                >
                  <p className={`text-sm font-medium sm:text-base ${
                    step.cancelled ? 'text-red-400' :
                    step.completed ? 'text-green-400' : 
                    step.current ? statusConfig.textColor : 
                    'text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="mt-1 wrap-break-word text-xs text-slate-500 sm:text-sm">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.main>

    {/* Footer */}
    <motion.footer 
      className="relative z-10 px-4 py-6 text-center sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 3 }}
    >
      <motion.p 
        className="text-sm font-medium text-slate-500 sm:text-base"
        whileHover={{ color: "#94a3b8" }}
        transition={{ duration: 0.3 }}
      >
        © 2025 Dokitap
      </motion.p>
    </motion.footer>
  </div>
);
};

export default RequestSuccess;