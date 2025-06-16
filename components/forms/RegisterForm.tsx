"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectItem } from "@/components/ui/select";
import {
  Doctors,
  GenderOptions,
  IdentificationTypes,
  PatientFormDefaultValues,
} from "@/constants";
import { registerPatient } from "@/lib/actions/patient.actions";
import { PatientFormValidation } from "@/lib/validation";

import "react-datepicker/dist/react-datepicker.css";
import "react-phone-number-input/style.css";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { FileUploader } from "../FileUploader";
import SubmitButton from "../SubmitButton";

interface User {
  $id: string;
  name: string;
  email: string;
  phone: string;
}

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const form = useForm<z.infer<typeof PatientFormValidation>>({
    resolver: zodResolver(PatientFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });

  const steps = useMemo(() => [
    { 
      id: 1, 
      title: "Personal", 
      subtitle: "Basic Info",
      icon: "👤",
      fields: ["name", "email", "phone", "birthDate", "gender", "address", "occupation", "emergencyContactName", "emergencyContactNumber"]
    },
    { 
      id: 2, 
      title: "Medical", 
      subtitle: "Health Info",
      icon: "🩺",
      fields: ["primaryPhysician", "insuranceProvider", "insurancePolicyNumber", "allergies", "currentMedication", "familyMedicalHistory", "pastMedicalHistory"]
    },
    { 
      id: 3, 
      title: "Identity", 
      subtitle: "Verification",
      icon: "🔒",
      fields: ["identificationType", "identificationNumber", "identificationDocument"]
    },
    { 
      id: 4, 
      title: "Consent", 
      subtitle: "Terms",
      icon: "✅",
      fields: ["treatmentConsent", "disclosureConsent", "privacyConsent"]
    },
  ], []);

  const checkStepCompletion = useCallback(() => {
    const newCompletedSteps: number[] = [];
    
    steps.forEach((step) => {
      const isStepComplete = step.fields.every((field) => {
        const value = form.getValues(field as keyof typeof PatientFormDefaultValues);
        if (field === "identificationDocument") {
          return value && value.length > 0;
        }
        return value !== undefined && value !== "" && value !== null;
      });
      
      if (isStepComplete) {
        newCompletedSteps.push(step.id);
      }
    });
    
    setCompletedSteps(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(newCompletedSteps)) {
        return newCompletedSteps;
      }
      return prev;
    });
  }, [steps, form]);

  const currentStepFields = steps[currentStep - 1].fields;
  const watchedFields = form.watch(currentStepFields as any);

  useEffect(() => {
    checkStepCompletion();
  }, [watchedFields, checkStepCompletion]);

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
    setIsLoading(true);

    let formData;
    if (values.identificationDocument?.length > 0) {
      const blobFile = new Blob([values.identificationDocument[0]], {
        type: values.identificationDocument[0].type,
      });

      formData = new FormData();
      formData.append("blobFile", blobFile);
      formData.append("fileName", values.identificationDocument[0].name);
    }

    try {
      const patient = {
        userId: user.$id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        birthDate: new Date(values.birthDate),
        gender: values.gender,
        address: values.address,
        occupation: values.occupation,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        primaryPhysician: values.primaryPhysician,
        insuranceProvider: values.insuranceProvider,
        insurancePolicyNumber: values.insurancePolicyNumber,
        allergies: values.allergies,
        currentMedication: values.currentMedication,
        familyMedicalHistory: values.familyMedicalHistory,
        pastMedicalHistory: values.pastMedicalHistory,
        identificationType: values.identificationType,
        identificationNumber: values.identificationNumber,
        identificationDocument: formData,
        privacyConsent: values.privacyConsent,
      };

      const newPatient = await registerPatient(patient);

      if (newPatient) {
        router.push(`/patients/${user.$id}/new-appointment`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGenderRadioGroup = useCallback((field: any) => (
    <FormControl>
      <RadioGroup
        className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-6'} h-auto`}
        onValueChange={field.onChange}
        value={field.value}
      >
        {GenderOptions.map((option) => (
          <div key={option} className="flex items-center space-x-3 group">
            <RadioGroupItem 
              value={option} 
              id={option}
              className="border-2 border-slate-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500 data-[state=checked]:border-transparent"
            />
            <Label 
              htmlFor={option} 
              className="cursor-pointer text-slate-300 group-hover:text-white transition-colors font-medium"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FormControl>
  ), [isMobile]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="group">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                iconSrc="/assets/icons/user.svg"
                iconAlt="user"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="email"
                label="Email"
                placeholder="your.email@example.com"
                iconSrc="/assets/icons/email.svg"
                iconAlt="email"
              />
              <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phone"
                label="Phone"
                placeholder="(+254) 700-000-000"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="birthDate"
                label="Date of Birth"
              />
              <CustomFormField
                fieldType={FormFieldType.SKELETON}
                control={form.control}
                name="gender"
                label="Gender"
                renderSkeleton={renderGenderRadioGroup}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="address"
                label="Address"
                placeholder="Westlands, Nairobi"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="occupation"
                label="Occupation"
                placeholder="Software Engineer"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="emergencyContactName"
                label="Emergency Contact"
                placeholder="Full name"
              />
              <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="emergencyContactNumber"
                label="Emergency Phone"
                placeholder="(+254) 700-000-000"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 md:space-y-6">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Primary Physician"
              placeholder="Select physician"
            >
              {Doctors.map((doctor) => (
                <SelectItem key={doctor.name} value={doctor.name}>
                  <div className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <Image
                      src={doctor.image}
                      width={40}
                      height={40}
                      alt="doctor"
                      className="rounded-full border-2 border-slate-600"
                    />
                    <div>
                      <p className="font-medium text-white">{doctor.name}</p>
                      <p className="text-sm text-slate-400">Specialist</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="insuranceProvider"
                label="Insurance Provider"
                placeholder="e.g., NHIF"
              />
              <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="insurancePolicyNumber"
                label="Policy Number"
                placeholder="e.g., CRABC123"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="allergies"
                label="Allergies"
                placeholder="List allergies or 'None'"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="currentMedication"
                label="Current Meds"
                placeholder="List medications or 'None'"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="familyMedicalHistory"
                label="Family History"
                placeholder="Family medical conditions"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="pastMedicalHistory"
                label="Medical History"
                placeholder="Previous medical events"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 md:space-y-6">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="identificationType"
              label="ID Type"
              placeholder="Select ID type"
            >
              {IdentificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded-lg transition-colors">
                    <span className="text-white font-medium">{type}</span>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="identificationNumber"
              label="ID Number"
              placeholder="Enter ID number"
            />

            <CustomFormField
              fieldType={FormFieldType.SKELETON}
              control={form.control}
              name="identificationDocument"
              label="Upload ID"
              renderSkeleton={(field) => (
                <FormControl>
                  <div className="relative">
                    <FileUploader files={field.value} onChange={field.onChange} />
                    <div className="mt-2 text-sm text-slate-400">
                      Upload a clear photo of your ID
                    </div>
                  </div>
                </FormControl>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 transition-colors">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="treatmentConsent"
                label="I consent to receive treatment for my health condition."
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 transition-colors">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="disclosureConsent"
                label="I consent to use of my health information."
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 transition-colors">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="privacyConsent"
                label="I agree to privacy policy and terms."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-600/20 via-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative z-10">
          <section className="relative min-h-[30vh] md:min-h-[40vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/50 to-transparent backdrop-blur-sm" />
            
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <div className="mb-4 md:mb-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                  <span className="relative text-3xl sm:text-4xl md:text-5xl animate-bounce filter drop-shadow-2xl">
                    👋
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    Welcome,
                  </h1>
                  <h2 className="bg-gradient-to-r from-blue-700 via-green-400 to-pink-400 bg-clip-text text-transparent text-xl sm:text-2xl md:text-3xl font-bold tracking-tight animate-pulse">
                    {user.name.split(' ')[0]}!
                  </h2>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4 md:mb-8 max-w-2xl mx-auto px-2">
                Your health journey begins here. Let's create your personalized 
                <span className="bg-gradient-to-r from-blue-700 to-green-400 bg-clip-text text-transparent font-semibold"> health profile </span>
                with precision and care.
              </p>
            </div>
          </section>

          <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 md:px-6 mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-700/50 p-4 md:p-6 shadow-2xl">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
                {steps.map((step, index) => (
                  <div key={step.id} className={`flex items-center ${isMobile ? 'w-full' : 'flex-1'}`}>
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className={`
                        relative flex ${isMobile ? 'flex-row items-center gap-3 p-3 w-full' : 'flex-col items-center justify-center p-4'} rounded-xl md:rounded-2xl transition-all duration-500 group cursor-pointer
                        ${currentStep === step.id 
                          ? 'bg-gradient-to-r from-blue-700 to-blue-700 shadow-lg scale-105' 
                          : completedSteps.includes(step.id)
                          ? 'bg-gradient-to-r from-green-700 to-teal-500 shadow-md hover:scale-102'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <div className={`${isMobile ? 'text-xl' : 'text-2xl mb-2'}`}>{step.icon}</div>
                      <div className={`text-center ${isMobile ? 'text-left' : ''}`}>
                        <div className={`
                          ${isMobile ? 'text-sm' : 'text-sm'} font-bold
                          ${currentStep === step.id || completedSteps.includes(step.id) 
                            ? 'text-white' 
                            : 'text-slate-400'
                          }
                        `}>
                          {step.title}
                        </div>
                        {!isMobile && (
                          <div className={`
                            text-xs
                            ${currentStep === step.id || completedSteps.includes(step.id) 
                              ? 'text-white/80' 
                              : 'text-slate-500'
                            }
                          `}>
                            {step.subtitle}
                          </div>
                        )}
                      </div>
                      
                      {completedSteps.includes(step.id) && currentStep !== step.id && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 md:w-3 md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {currentStep === step.id && (
                        <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50 animate-pulse" />
                      )}
                    </button>
                    
                    {!isMobile && index < steps.length - 1 && (
                      <div className={`
                        flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all duration-500
                        ${completedSteps.includes(step.id) && completedSteps.includes(step.id + 1)
                          ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                          : completedSteps.includes(step.id) || currentStep > step.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-slate-700'
                        }
                      `} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 md:px-6 pb-12 md:pb-20">
            <div className="rounded-2xl md:rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-4 md:p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                <div className={`
                  flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl shadow-lg
                  ${currentStep === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                    currentStep === 2 ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                    currentStep === 3 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    'bg-gradient-to-r from-green-500 to-teal-500'
                  }
                `}>
                  <span className="text-xl md:text-2xl">{steps[currentStep - 1].icon}</span>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base">
                    Step {currentStep} of {steps.length}
                  </p>
                </div>
              </div>

              {renderStepContent()}

              <div className="flex flex-col-reverse md:flex-row justify-between items-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-700 gap-4 md:gap-0">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`
                    flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-300 w-full md:w-auto justify-center
                    ${currentStep === 1 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500 hover:scale-105'
                    }
                  `}
                >
                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`
                        w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300
                        ${currentStep === step.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-6 md:w-8' 
                          : completedSteps.includes(step.id)
                          ? 'bg-green-500'
                          : 'bg-slate-600'
                        }
                      `}
                    />
                  ))}
                </div>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg md:rounded-xl hover:from-blue-400 hover:to-emerald-400 hover:scale-105 transition-all duration-300 w-full md:w-auto justify-center"
                  >
                    Next
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <SubmitButton 
                    isLoading={isLoading} 
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-medium px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 w-full md:w-auto"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2 text-sm md:text-base">
                        <svg className="animate-spin h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm md:text-base">
                        Complete Registration
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </SubmitButton>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;