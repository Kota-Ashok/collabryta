import React, { useState, useEffect } from "react";
import {
    User,
    Bell,
    ShieldCheck,
    Save,
    Loader2,
    CheckCircle2,
    Eye,
    Smartphone,
    Globe,
    Lock,
    Activity,
    Shield,
    Zap,
    Cpu,
    Star,
    ArrowUpRight,
    ChevronRight,
    Search,
    Languages,
    Clock
} from "lucide-react";
import { authService } from "../../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const SettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [testNotifStatus, setTestNotifStatus] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await authService.getCurrentUser();
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleUpdate = (field: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccess(false);
            const { id, email, hashed_password, last_seen, status, ...updateData } = settings;
            await authService.updateProfile(updateData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save settings", error);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestNotif = () => {
        setTestNotifStatus("Transmitting...");
        setTimeout(() => {
            setTestNotifStatus("Delivered");
            setTimeout(() => setTestNotifStatus(null), 3000);
        }, 1500);
    };

    const handleEnable2FA = () => {
        if (settings.two_factor_enabled) {
            handleUpdate('two_factor_enabled', false);
        } else {
            setShow2FAModal(true);
        }
    };

    const handleVerifyOTP = () => {
        setIs2FALoading(true);
        setTimeout(() => {
            if (otpCode === "123456") {
                handleUpdate('two_factor_enabled', true);
                setShow2FAModal(false);
                setOtpCode("");
            } else {
                alert("Invalid OTP code. Please try 123456 for testing.");
            }
            setIs2FALoading(false);
        }, 1000);
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfe]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6" />
                <p className="text-sm font-semibold text-slate-400">Accessing preferences...</p>
            </div>
        );
    }

    const Section = ({ icon: Icon, title, desc, children }: any) => (
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-8 animate-fade-in transition-all">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1.5">{title}</h2>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{desc}</p>
                    </div>
                </div>
            </div>
            <div className="p-8">{children}</div>
        </section>
    );

    const Toggle = ({ active, label, subtitle, field, disabled }: any) => (
        <div className={`flex items-center justify-between py-6 first:pt-0 border-b border-slate-50 last:border-0 last:pb-0 ${disabled ? 'opacity-40' : ''}`}>
            <div>
                <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{label}</p>
                <p className="text-xs font-medium text-slate-400">{subtitle}</p>
            </div>
            <button
                onClick={() => !disabled && handleUpdate(field, !active)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 shadow-inner ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${active ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative">
            {/* Background Decor */}
            {/* Background Decor Removed */}

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Settings</h1>
                        <p className="text-slate-500 font-medium text-lg">Manage your account preferences and security options.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-8 py-3 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 ${success
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {saving ? (
                            <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
                        ) : success ? (
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                        ) : (
                            <Save size={20} strokeWidth={2.5} />
                        )}
                        <span className="font-bold">{saving ? "Saving..." : success ? "Saved Successfully" : "Save Changes"}</span>
                    </button>
                </div>

                {/* Profile Section (NON-EDITABLE) */}
                <Section icon={User} title="Profile Information" desc="Identity details provided by organization">
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-sm">
                                {settings.avatar ? (
                                    <img src={settings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-slate-200">{settings.name?.charAt(0)}</span>
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Lock size={24} className="text-white drop-shadow-md" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={12} /> Managed Account
                                </h3>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-lg">
                                    Your profile information is managed by your organization's directory (LDAP/SSO) and cannot be edited directly. Contact your admin for changes.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={settings.name || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm cursor-not-allowed"
                                    />
                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Job Title</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={settings.job_title || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm cursor-not-allowed"
                                    />
                                    <Shield size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={settings.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold text-sm cursor-not-allowed"
                                    />
                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Region & Language */}
                <Section icon={Globe} title="Region & Language" desc="Local settings and time coordination">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Language</label>
                            <div className="relative group">
                                <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleUpdate('language', e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    <option>English (US)</option>
                                    <option>Hindi (HI)</option>
                                    <option>Spanish (ES)</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Time Zone</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={18} />
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => handleUpdate('timezone', e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-bold text-slate-700 transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="(GMT+05:30) Mumbai, New Delhi">India (GMT+5:30)</option>
                                    <option value="(GMT-08:00) Pacific Time">Pacific Time (GMT-8:00)</option>
                                    <option value="(GMT+00:00) London, UTC">London (GMT+0:00)</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={18} />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Privacy */}
                <Section icon={Eye} title="Privacy" desc="Manage what information others can see">
                    <div className="space-y-4">
                        <Toggle active={settings.show_online_status} label="Show Online Status" subtitle="Allow team members to see when you are active" field="show_online_status" />
                        <Toggle active={settings.share_local_time} label="Share Local Time" subtitle="Help team members know your current working hours" field="share_local_time" />
                    </div>
                </Section>

                {/* Notifications */}
                <Section icon={Bell} title="Notifications" desc="Choose how you want to be notified">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> Email Notifications
                            </h4>
                            <div className="space-y-4">
                                <Toggle active={settings.email_tasks} label="Task Updates" subtitle="Notifications for task assignments" field="email_tasks" />
                                <Toggle active={settings.email_summary} label="Weekly Report" subtitle="Progress summary of the week" field="email_summary" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" /> Push Notifications
                            </h4>
                            <div className="space-y-4">
                                <Toggle active={settings.push_meetings} label="Meeting Alerts" subtitle="Reminders before sessions start" field="push_meetings" />
                                <Toggle active={settings.push_chat} label="Direct Messages" subtitle="Alerts for new chat messages" field="push_chat" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
                        <button
                            onClick={handleSendTestNotif}
                            disabled={!!testNotifStatus}
                            className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                        >
                            {testNotifStatus === "Delivered" ? <CheckCircle2 size={16} className="text-emerald-500" strokeWidth={3} /> : <Zap size={16} className="text-amber-500" fill="currentColor" />}
                            {testNotifStatus || "Send Test Notification"}
                        </button>
                    </div>
                </Section>

                {/* Security */}
                <Section icon={ShieldCheck} title="Security & Access" desc="Reinforce your account stabilization">
                    <div className="space-y-8">
                        <div className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-8 ${settings.two_factor_enabled
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200'
                            : 'bg-slate-50 border-slate-100'
                            }`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${settings.two_factor_enabled ? 'bg-white/20 text-white backdrop-blur-md' : 'bg-white text-blue-600 border border-slate-200'
                                    }`}>
                                    <ShieldCheck size={32} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold tracking-tight">Two-Factor Authentication</p>
                                    <p className={`text-sm font-medium ${settings.two_factor_enabled ? 'text-blue-100/90' : 'text-slate-500'}`}>
                                        {settings.two_factor_enabled ? 'Your account is currently fortified.' : 'Add an extra layer of protection to your account.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleEnable2FA}
                                className={`px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg ${settings.two_factor_enabled
                                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                    }`}
                            >
                                {settings.two_factor_enabled ? 'Disable 2FA' : 'Enable Security'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {show2FAModal && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -20 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -20 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 bg-white rounded-3xl border border-slate-100 space-y-8 shadow-xl shadow-slate-200/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                                <Smartphone size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">Device Verification</h4>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Secure OTP Validation</p>
                                            </div>
                                        </div>

                                        <div className="pl-16">
                                            <p className="text-sm font-medium text-slate-500 max-w-md mb-6 leading-relaxed">
                                                Please enter the 6-digit verification code sent to your registered mobile device. <br />
                                                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg inline-block mt-2 border border-blue-100">Test Code: 123456</span>
                                            </p>

                                            <div className="flex flex-wrap items-center gap-6">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    className="w-48 bg-slate-50 border border-slate-200 px-6 py-4 text-3xl font-bold tracking-[0.4em] rounded-2xl text-center text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-inner placeholder:text-slate-200 transition-all font-mono"
                                                />
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handleVerifyOTP}
                                                        disabled={otpCode.length !== 6 || is2FALoading}
                                                        className="px-8 py-4 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg hover:shadow-xl"
                                                    >
                                                        {is2FALoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                        Verify Code
                                                    </button>
                                                    <button
                                                        onClick={() => setShow2FAModal(false)}
                                                        className="px-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Section>

            </div>
        </div>
    );
};

export default SettingsPage;
