export const GenderOptions = ["male", "female", "other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "+254", // Default to Kenya country code
  birthDate: new Date(Date.now()),
  gender: "Male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "+254", // Also default emergency contact to Kenya
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "Birth Certificate",
  "Driver's License",
  "Medical Insurance Card/Policy",
  "Military ID Card",
  "National Identity Card",
  "Passport",
  "Resident Alien Card (Green Card)",
  "Social Security Card",
  "State ID Card",
  "Student ID Card",
  "Voter ID Card",
];

export const Doctors = [
  {
    image: "/assets/images/dr-green.png",
    name: "Ken Warui",
  },
  {
    image: "/assets/images/dr-cameron.png",
    name: "Joy Wambui",
  },
  {
    image: "/assets/images/dr-livingston.png",
    name: "John Mwangi",
  },
  {
    image: "/assets/images/dr-peter.png",
    name: "Sospeter Omollo",
  },
  {
    image: "/assets/images/dr-powell.png",
    name: "Mary Wangui",
  },
  {
    image: "/assets/images/dr-remirez.png",
    name: "john Mwenda",
  },
  {
    image: "/assets/images/dr-lee.png",
    name: "Evalyne Moraa",
  },
  {
    image: "/assets/images/dr-cruz.png",
    name: "Aliyah Mwende",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Jaysen Mutua",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};
