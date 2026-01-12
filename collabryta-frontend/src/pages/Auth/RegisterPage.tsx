import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowUpRight, Sparkles, Zap, Users2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { motion } from "framer-motion";

const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            await authService.register({
                email: formData.email,
                name: formData.name,
                password: formData.password
            });
            navigate("/login");
        } catch (error: any) {
            console.error("Registration failed:", error);
            alert(error.response?.data?.detail || "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">

            {/* Left Side: Branding */}
            <div className="lg:w-1/2 bg-indigo-600 text-white relative flex flex-col justify-between p-12 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                {/* Logo Area */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <Sparkles size={20} className="text-white" fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Collabryta.</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-lg my-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-8">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">revolution.</span>
                        </h1>
                        <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                            Create your account today and unlock powerful tools designed to supercharge your productivity.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-indigo-100">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <Zap size={20} className="text-cyan-300" />
                                </div>
                                <span className="font-medium">Lightning Fast Access</span>
                            </div>
                            <div className="flex items-center gap-4 text-indigo-100">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <Users2 size={20} className="text-cyan-300" />
                                </div>
                                <span className="font-medium">Seamless Team Collaboration</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Area */}
                <div className="relative z-10 opacity-60 text-sm font-medium">
                    © 2024 Collabryta Inc.
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12 relative overflow-y-auto">
                <div className="w-full max-w-[400px] py-10">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Create an account</h2>
                            <p className="text-slate-500">Enter your details to get started.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-base hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowUpRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 font-medium">
                                Already have an account?{" "}
                                <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
