"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Calendar, Clock, X, User, Phone, Mail, Eye, FileText, UserCheck, Bell, Settings, LogOut, ChevronDown, TrendingUp, Activity, Users, Calendar as CalendarIcon } from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";

const AdminPage = () => {
  // State management
  const [appointments, setAppointments] = useState({
    documents: [],
    scheduledCount: 0,
    pendingCount: 0,
    cancelledCount: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load data 
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const appointmentsData = await getRecentAppointmentList();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Extract patients from appointments 
  const patients = useMemo(() => {
    const uniquePatients = new Map();
    appointments.documents.forEach(appointment => {
      if (appointment.patient && !uniquePatients.has(appointment.patient.$id)) {
        uniquePatients.set(appointment.patient.$id, appointment.patient);
      }
    });
    return Array.from(uniquePatients.values());
  }, [appointments.documents]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.documents.filter((appointment) => {
      const matchesSearch = searchTerm === '' || 
        appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.primaryPhysician?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || appointment.status === statusFilter;
      
      const matchesDate = dateFilter === '' || 
        new Date(appointment.schedule).toDateString() === new Date(dateFilter).toDateString();
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments.documents, searchTerm, statusFilter, dateFilter]);

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      return searchTerm === '' || 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);
    });
  }, [patients, searchTerm]);

  // Patient Details Modal Component
  const PatientDetailsModal = ({ patient, onClose }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="sticky top-0 bg-linear-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl p-6 border-b border-slate-700/50 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
              <p className="text-slate-400 text-sm">Patient ID: {patient.$id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-linear-to-br from-slate-800/50 to-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Name</span>
                <p className="text-white font-medium">{patient.name || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Email</span>
                <p className="text-white font-medium">{patient.email || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Phone</span>
                <p className="text-white font-medium">{patient.phone || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Gender</span>
                <p className="text-white font-medium capitalize">{patient.gender || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Birth Date</span>
                <p className="text-white font-medium">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Occupation</span>
                <p className="text-white font-medium">{patient.occupation || 'N/A'}</p>
              </div>
            </div>
            <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
              <span className="text-slate-400 text-sm">Address</span>
              <p className="text-white font-medium">{patient.address || 'N/A'}</p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-linear-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-6 border border-red-700/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Name</span>
                <p className="text-white font-medium">{patient.emergencyContactName || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Number</span>
                <p className="text-white font-medium">{patient.emergencyContactNumber || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Provider</span>
                <p className="text-white font-medium">{patient.emergencyProvider || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Policy Number</span>
                <p className="text-white font-medium">{patient.emergencyPolicyNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-linear-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-6 border border-green-700/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Medical Information</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Primary Physician</span>
                <p className="text-white font-medium">{patient.primaryPhysician || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Allergies</span>
                <p className="text-white font-medium">{patient.allergies || 'None specified'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Current Medication</span>
                <p className="text-white font-medium">{patient.currentMedication || 'None specified'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Family Medical History</span>
                <p className="text-white font-medium">{patient.familyMedicalHistory || 'None specified'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Past Medical History</span>
                <p className="text-white font-medium">{patient.pastMedicalHistory || 'None specified'}</p>
              </div>
            </div>
          </div>

          {/* Insurance & Identification */}
          <div className="bg-linear-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 border border-purple-700/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Insurance & Identification</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Insurance Provider</span>
                <p className="text-white font-medium">{patient.insuranceProvider || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Policy Number</span>
                <p className="text-white font-medium">{patient.insurancePolicyNumber || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">ID Type</span>
                <p className="text-white font-medium">{patient.identificationType || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">ID Number</span>
                <p className="text-white font-medium">{patient.identificationNumber || 'N/A'}</p>
              </div>
            </div>
            {patient.identificationDocumentUrl && (
              <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">ID Document</span>
                <a href={patient.identificationDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium underline decoration-dotted underline-offset-4 transition-colors">
                  View Document
                </a>
              </div>
            )}
          </div>

          {/* Consent Information */}
          <div className="bg-linear-to-br from-amber-900/20 to-yellow-900/20 rounded-2xl p-6 border border-amber-700/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Consent Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Privacy Consent</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.privacyConsent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {patient.privacyConsent ? 'Granted' : 'Not Granted'}
                </span>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Treatment Consent</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.treatmentConsent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {patient.treatmentConsent ? 'Granted' : 'Not Granted'}
                </span>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-slate-400 text-sm">Disclosure Consent</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${patient.disclosureConsent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {patient.disclosureConsent ? 'Granted' : 'Not Granted'}
                </span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-linear-to-br from-slate-800/50 to-slate-700/30 rounded-2xl p-6 border border-slate-600/30">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">System Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">User ID</span>
                <p className="text-white font-medium font-mono text-sm">{patient.userId || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Patient ID</span>
                <p className="text-white font-medium font-mono text-sm">{patient.$id || 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Registration Date</span>
                <p className="text-white font-medium">{patient.$createdAt ? new Date(patient.$createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <span className="text-slate-400 text-sm">Last Updated</span>
                <p className="text-white font-medium">{patient.$updatedAt ? new Date(patient.$updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading Dashboard...</div>
          <div className="text-slate-400 text-sm mt-2">Fetching your data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950/90 via-slate-950/90 to-transparent backdrop-blur-sm">
      {/* Enhanced Header */}
      <header className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-700/50 sticky top-0 z-40 shadow-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="cursor-pointer group">
              <Image
                src="/assets/icons/logo-full.svg"
                height={32}
                width={162}
                alt="logo"
                className="h-10 w-fit transition-transform group-hover:scale-105"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button className="relative p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200 hover:scale-105">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* Admin Badge */}
              <div className="px-4 py-2 bg-linear-to-r from-blue-600 via-green-700 to-blue-600 rounded-2xl shadow-lg">
                <p className="text-white font-semibold text-sm">Admin Dashboard</p>
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-200">
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Enhanced Welcome Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-linear-to-r from-white via-blue-100 to-purple-200 bg-clip-text ">
                Welcome back 👋
              </h1>
              <p className="text-slate-400 text-lg mt-2">
                Manage your appointments and patient records efficiently
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center text-slate-400 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  System Online
                </div>
                <div className="text-slate-400 text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-linear-to-br from-blue-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-slate-700/50">
                <Activity className="w-16 h-16 text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Scheduled</p>
                <p className="text-4xl font-bold text-white mt-2">{appointments.scheduledCount}</p>
                <div className="flex items-center mt-3">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <p className="text-green-400 text-sm font-medium">+12% from last week</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-linear-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold text-white mt-2">{appointments.pendingCount}</p>
                <div className="flex items-center mt-3">
                  <Clock className="w-4 h-4 text-yellow-400 mr-1" />
                  <p className="text-yellow-400 text-sm font-medium">Awaiting confirmation</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-linear-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Cancelled</p>
                <p className="text-4xl font-bold text-white mt-2">{appointments.cancelledCount}</p>
                <div className="flex items-center mt-3">
                  <X className="w-4 h-4 text-red-400 mr-1" />
                  <p className="text-red-400 text-sm font-medium">-5% from last week</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-linear-to-br from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <X className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          <div className="group bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Patients</p>
                <p className="text-4xl font-bold text-white mt-2">{patients.length}</p>
                <div className="flex items-center mt-3">
                  <Users className="w-4 h-4 text-purple-400 mr-1" />
                  <p className="text-purple-400 text-sm font-medium">Registered patients</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-linear-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <UserCheck className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Tab Navigation */}
        <section className="bg-slate-800/50 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('appointments');
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === 'appointments'
                  ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Appointments</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{appointments.documents.length}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('patients');
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
             className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
               activeTab === 'patients'
                 ? 'bg-linear-to-r from-blue-600 to-green-700 text-white shadow-lg transform scale-105'
                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
             }`}
           >
             <User className="w-5 h-5" />
             <span>Patient Records</span>
             <span className="bg-white/20 px-2 py-1 rounded-full text-xs">{patients.length}</span>
           </button>
         </div>
       </section>

       {/* Enhanced Search and Filter Section */}
       <section className="bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-xl">
         <div className="flex flex-col space-y-4">
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold text-white">
                 {activeTab === 'appointments' ? 'Appointment Management' : 'Patient Records Management'}
               </h2>
               <p className="text-slate-400 mt-1">
                 {activeTab === 'appointments' 
                   ? 'Track and manage all patient appointments' 
                   : 'View detailed patient information and records'
                 }
               </p>
             </div>
             <div className="hidden md:block">
               <div className="flex items-center space-x-2 text-slate-400 text-sm">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span>Real-time updates</span>
               </div>
             </div>
           </div>
           
           <div className="flex flex-col lg:flex-row gap-4 items-center">
             {/* Enhanced Search Input */}
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
               <input
                 type="text"
                 placeholder={activeTab === 'appointments' ? "Search appointments, patients, or physicians..." : "Search patients by name, email, or phone..."}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-xl"
               />
               {searchTerm && (
                 <button
                   onClick={() => setSearchTerm('')}
                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                 >
                   <X className="w-4 h-4" />
                 </button>
               )}
             </div>

             {/* Enhanced Filters - Only for appointments */}
             {activeTab === 'appointments' && (
               <div className="flex flex-col sm:flex-row gap-3">
                 {/* Status Filter */}
                 <div className="relative">
                   <select 
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="appearance-none bg-slate-700/50 border border-slate-600/50 rounded-2xl px-6 py-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-xl min-w-[150px]"
                   >
                     <option value="">All Status</option>
                     <option value="scheduled">Scheduled</option>
                     <option value="pending">Pending</option>
                     <option value="cancelled">Cancelled</option>
                   </select>
                   <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                 </div>

                 {/* Date Filter */}
                 <div className="relative">
                   <input
                     type="date"
                     value={dateFilter}
                     onChange={(e) => setDateFilter(e.target.value)}
                     className="bg-slate-700/50 border border-slate-600/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-xl"
                   />
                 </div>
               </div>
             )}

             {/* Clear Filters Button */}
             {(searchTerm || statusFilter || dateFilter) && (
               <button
                 onClick={() => {
                   setSearchTerm('');
                   setStatusFilter('');
                   setDateFilter('');
                 }}
                 className="px-6 py-4 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-lg"
               >
                 <X className="w-4 h-4" />
                 <span>Clear Filters</span>
               </button>
             )}
           </div>
         </div>
       </section>

       {/* Enhanced Content Section */}
       {activeTab === 'appointments' ? (
         /* Enhanced Appointments Table */
         <section className="bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-slate-700/50 bg-linear-to-r from-slate-800/50 to-slate-700/50">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-bold text-white">
                   {filteredAppointments.length > 0 ? `${filteredAppointments.length} Appointments Found` : 'Recent Appointments'}
                 </h3>
                 <p className="text-slate-400 text-sm mt-1">Manage and track all your appointments</p>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-slate-400 text-sm">Live updates</span>
               </div>
             </div>
           </div>
           
           <div className="overflow-x-auto">
             <DataTable 
               columns={columns} 
               data={filteredAppointments}
               className="bg-transparent"
             />
           </div>
         </section>
       ) : (
         /* Enhanced Patient Records */
         <section className="bg-linear-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
           <div className="p-6 border-b border-slate-700/50 bg-linear-to-r from-slate-800/50 to-slate-700/50">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-bold text-white">
                   {filteredPatients.length > 0 ? `${filteredPatients.length} Patients Found` : 'Patient Records'}
                 </h3>
                 <p className="text-slate-400 text-sm mt-1">View and manage patient information</p>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-slate-400 text-sm">Secure access</span>
               </div>
             </div>
           </div>
           
           <div className="p-6">
             {filteredPatients.length > 0 ? (
               <div className="grid gap-4">
                 {filteredPatients.map((patient, index) => (
                   <div 
                     key={patient.$id} 
                     className="group bg-linear-to-r from-slate-700/30 to-slate-600/30 rounded-2xl p-6 hover:from-slate-600/40 hover:to-slate-500/40 transition-all duration-300 border border-slate-600/30 hover:border-slate-500/50 hover:shadow-xl animate-in slide-in-from-bottom-4"
                     style={{ animationDelay: `${index * 50}ms` }}
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-6">
                         <div className="relative">
                           <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                             <User className="w-8 h-8 text-white" />
                           </div>
                           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                           </div>
                         </div>
                         <div className="space-y-1">
                           <h4 className="text-white font-bold text-lg">{patient.name}</h4>
                           <div className="flex items-center space-x-4 text-slate-400 text-sm">
                             <div className="flex items-center space-x-1">
                               <Mail className="w-4 h-4" />
                               <span>{patient.email}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Phone className="w-4 h-4" />
                               <span>{patient.phone}</span>
                             </div>
                           </div>
                           <div className="flex items-center space-x-2">
                             <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                               ID: {patient.$id.slice(-8)}
                             </span>
                             <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                               Active
                             </span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center space-x-4">
                         <div className="text-right">
                           <p className="text-slate-400 text-xs">Primary Physician</p>
                           <p className="text-white text-sm font-medium">{patient.primaryPhysician || 'Not assigned'}</p>
                           <p className="text-slate-400 text-xs mt-1">
                             Registered: {patient.$createdAt ? new Date(patient.$createdAt).toLocaleDateString() : 'N/A'}
                           </p>
                         </div>
                         <button
                           onClick={() => setSelectedPatient(patient)}
                           className="group/btn px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105 shadow-lg hover:shadow-xl"
                         >
                           <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                           <span>View Details</span>
                         </button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-16">
                 <div className="w-24 h-24 bg-linear-to-br from-slate-700 to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <User className="w-12 h-12 text-slate-400" />
                 </div>
                 <h3 className="text-white text-lg font-semibold mb-2">No Patients Found</h3>
                 <p className="text-slate-400 mb-6">
                   {searchTerm ? 'Try adjusting your search criteria to find patients.' : 'No patient records are currently available.'}
                 </p>
                 {searchTerm && (
                   <button
                     onClick={() => setSearchTerm('')}
                     className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 hover:scale-105"
                   >
                     Clear Search
                   </button>
                 )}
               </div>
             )}
           </div>
         </section>
       )}

       {/* Enhanced Quick Actions */}
       <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <button className="group bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg border border-blue-500/20">
           <div className="flex items-center justify-between mb-4">
             <Calendar className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
             <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors"></div>
           </div>
           <p className="font-bold text-lg">New Appointment</p>
           <p className="text-blue-100 text-sm mt-1">Schedule a new patient visit</p>
         </button>
         
         <button 
           onClick={() => setActiveTab('patients')}
           className="group bg-linear-to-br from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg border border-green-500/20"
         >
           <div className="flex items-center justify-between mb-4">
             <User className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
             <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors"></div>
           </div>
           <p className="font-bold text-lg">Patient Records</p>
           <p className="text-green-100 text-sm mt-1">Access patient information</p>
         </button>
         
         <button className="group bg-linear-to-br from-purple-600 via-purple-700 to-purple-800 hover:from-purple-700 hover:via-purple-800 hover:to-purple-900 text-white rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg border border-purple-500/20">
           <div className="flex items-center justify-between mb-4">
             <Phone className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
             <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors"></div>
           </div>
           <p className="font-bold text-lg">Contact Patient</p>
           <p className="text-purple-100 text-sm mt-1">Reach out to patients</p>
         </button>
         
         <button className="group bg-linear-to-br from-orange-600 via-orange-700 to-orange-800 hover:from-orange-700 hover:via-orange-800 hover:to-orange-900 text-white rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg border border-orange-500/20">
           <div className="flex items-center justify-between mb-4">
             <Mail className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
             <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors"></div>
           </div>
           <p className="font-bold text-lg">Send Reminder</p>
           <p className="text-orange-100 text-sm mt-1">Notify about appointments</p>
         </button>
       </section>
     </div>

     {/* Enhanced Patient Details Modal */}
     {selectedPatient && (
       <PatientDetailsModal 
         patient={selectedPatient} 
         onClose={() => setSelectedPatient(null)} 
       />
     )}
   </div>
 );
};

export default AdminPage;