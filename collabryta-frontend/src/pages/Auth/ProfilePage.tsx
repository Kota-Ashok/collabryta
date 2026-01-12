import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../../services/authService";
import {
  Mail, Phone, MapPin, Briefcase, Camera, Save,
  Loader2, Lock, Star, Shield, Activity, Zap,
  ArrowRight, UserCheck, ArrowUpRight, ShieldCheck,
  ChevronRight, Facebook, Twitter, Linkedin, Github
} from "lucide-react";

const ProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>({
    name: "",
    email: "",
    role: "Member",
    job_title: "",
    avatar: "",
    phone: "",
    address: "",
    bio: "",
    two_factor_enabled: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setProfile({
          ...userData,
          avatar: userData.avatar || ""
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { id, email, hashed_password, last_seen, status, ...updateData } = profile;
      await authService.updateProfile(updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev: any) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfe]">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
        <p className="text-sm font-semibold text-slate-400">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 px-8 py-10 lg:px-12 animate-fade-in relative">
      <div className="max-w-6xl mx-auto">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">User Profile</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your identity and professional information.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className={`btn-primary shadow-lg shadow-indigo-100 ${isEditing && !saving ? 'bg-indigo-600' : ''}`}
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEditing ? (
                <Save size={18} />
              ) : (
                <Zap size={18} />
              )}
              {saving ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Avatar Card & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm relative overflow-hidden group">
              {/* Decorative background circle */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 rounded-full" />

              <div className="relative flex flex-col items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  className={`relative mb-8 group/avatar ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={handleImageClick}
                >
                  <div className={`w-40 h-40 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-slate-50 flex items-center justify-center transition-all ${isEditing ? 'ring-4 ring-indigo-500/20' : ''}`}>
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-slate-300">{getInitials(profile.name)}</span>
                    )}
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[28px]">
                        <Camera className="text-white w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 text-indigo-600">
                    <ShieldCheck size={24} />
                  </div>
                </div>

                <div className="text-center w-full">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h2>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-8">{profile.job_title || profile.role}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-default">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Clearance</p>
                      <p className="text-sm font-bold text-slate-700">{profile.role}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-default">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <p className="text-sm font-bold text-slate-700">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links card */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Social Connectivity</h3>
              <div className="flex justify-between items-center">
                <SocialButton icon={Github} />
                <SocialButton icon={Twitter} />
                <SocialButton icon={Linkedin} />
                <SocialButton icon={Facebook} />
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info Form */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 font-bold flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Professional Dossier</h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Identification & contact nodes</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Briefcase size={20} />
                </div>
              </div>

              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="input-field disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-50 disabled:shadow-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Current Position</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="e.g. Creative Director"
                      value={profile.job_title || ''}
                      onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                      className="input-field disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-50 disabled:shadow-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Work Email (Read-only)</label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled={true}
                        value={profile.email}
                        className="input-field bg-slate-50 text-slate-400 border-slate-50 shadow-none cursor-not-allowed pl-11"
                      />
                      <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Contact Phone</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!isEditing}
                        placeholder="+1 (555) 000-0000"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="input-field disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-50 disabled:shadow-none pl-11"
                      />
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 shadow-none" />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Professional Background</label>
                    <textarea
                      rows={5}
                      disabled={!isEditing}
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell the team about your expertise and background..."
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-[28px] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-medium text-slate-900 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-50 disabled:shadow-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Banner Card */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield size={100} />
              </div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold tracking-tight mb-0.5">Account Stabilization</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Two-Factor Authentication protocol active</p>
                </div>
              </div>
              <button className="relative z-10 px-8 py-3.5 bg-white text-slate-900 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-lg group">
                Security Audit
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ icon: Icon }: any) => (
  <button className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
    <Icon size={20} />
  </button>
);

export default ProfilePage;
