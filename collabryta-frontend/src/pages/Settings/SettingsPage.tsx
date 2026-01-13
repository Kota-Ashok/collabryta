import React, { useState, useEffect } from "react";
import {
    User,
    Bell,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Eye,
    Globe,
    Lock,
    Shield,
    ChevronRight,
    Zap,
    Mail
} from "lucide-react";
import { authService } from "../../services/authService";

const SettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [testText, setTestText] = useState("Send Test Notification");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await authService.getCurrentUser();
                setSettings(data);
            } catch (error) {
                console.error("Failed to load settings", error);
                setError(true);
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

    const handleToggle2FA = () => {
        handleUpdate('two_factor_enabled', !settings.two_factor_enabled);
    };

    const handleTestNotif = () => {
        if (!settings.email_tasks && !settings.push_chat) {
            alert("Please enable at least one notification channel first.");
            return;
        }
        setTestText("Sent!");
        setTimeout(() => setTestText("Send Test Notification"), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Loading settings...</p>
            </div>
        );
    }

    if (error || !settings) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
                <ShieldCheck size={32} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Failed to load settings</p>
            </div>
        );
    }

    const Section = ({ icon: Icon, title, desc, children }: any) => (
        <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
                <div className="p-2 bg-zinc-50 rounded-lg text-zinc-600">
                    <Icon size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
                    <p className="text-xs text-zinc-500">{desc}</p>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );

    const Toggle = ({ active, label, subtitle, field, disabled }: any) => (
        <div className={`flex items-center justify-between py-4 first:pt-0 last:pb-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div>
                <p className="text-sm font-medium text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-500">{subtitle}</p>
            </div>
            <button
                onClick={() => !disabled && handleUpdate(field, !active)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-zinc-900' : 'bg-zinc-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="animate-in pb-12 max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Settings</h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your account preferences and security.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : success ? (
                            <CheckCircle2 size={16} />
                        ) : null}
                        {saving ? "Saving..." : success ? "Saved" : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <Section icon={User} title="Profile" desc="Your identity in the workspace">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-500 border border-zinc-200 overflow-hidden shrink-0">
                            {settings.avatar ? (
                                <img src={settings.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                settings.name?.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500">Full Name</label>
                                    <input
                                        type="text"
                                        value={settings.name || ''}
                                        disabled
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500">Job Title</label>
                                    <input
                                        type="text"
                                        value={settings.job_title || ''}
                                        disabled
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-zinc-500">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={settings.email || ''}
                                            disabled
                                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed pl-9"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                            <Mail size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 w-fit">
                                <Shield size={12} />
                                <span>Managed by organization. Contact admin for changes.</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Region */}
                <Section icon={Globe} title="Region" desc="Language and time preferences">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Language</label>
                            <div className="relative">
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleUpdate('language', e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 appearance-none"
                                >
                                    <option>English (US)</option>
                                    <option>Spanish (ES)</option>
                                    <option>Hindi (HI)</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 rotate-90" size={14} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-500">Time Zone</label>
                            <div className="relative">
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => handleUpdate('timezone', e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 appearance-none"
                                >
                                    <option value="(GMT+05:30) Mumbai, New Delhi">India (GMT+5:30)</option>
                                    <option value="(GMT-08:00) Pacific Time">Pacific Time (GMT-8:00)</option>
                                    <option value="(GMT+00:00) London, UTC">London (GMT+0:00)</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 rotate-90" size={14} />
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Privacy & Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section icon={Eye} title="Privacy" desc="Visibility settings">
                        <div className="space-y-2">
                            <Toggle active={settings.show_online_status} label="Online Status" subtitle="Show when you're active" field="show_online_status" />
                            <Toggle active={settings.share_local_time} label="Share Local Time" subtitle="Display your time zone" field="share_local_time" />
                        </div>
                    </Section>

                    <Section icon={Bell} title="Notifications" desc="Alert preferences">
                        <div className="space-y-2">
                            <Toggle active={settings.email_tasks} label="Task Emails" subtitle="Updates on assignments" field="email_tasks" />
                            <Toggle active={settings.push_chat} label="Chat Pushes" subtitle="Direct message alerts" field="push_chat" />
                        </div>
                        <button
                            onClick={handleTestNotif}
                            className="mt-4 text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                            <Zap size={12} />
                            {testText}
                        </button>
                    </Section>
                </div>

                {/* Security */}
                <Section icon={ShieldCheck} title="Security" desc="Account protection">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                        <div className="flex gap-4">
                            <div className={`p-2 rounded-lg h-fit ${settings.two_factor_enabled ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">Two-Factor Authentication</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {settings.two_factor_enabled
                                        ? "Your account is secured with 2FA."
                                        : "Add an extra layer of security."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggle2FA}
                            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-white transition-all"
                        >
                            {settings.two_factor_enabled ? "Disable" : "Enable"}
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default SettingsPage;
