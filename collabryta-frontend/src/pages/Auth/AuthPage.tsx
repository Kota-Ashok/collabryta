import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowUpRight, Activity, Sparkles, ShieldCheck, Globe2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { motion } from "framer-motion";

const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.login(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">

      {/* Left Side: "Matter" / Branding */}
      <div className="lg:w-1/2 bg-slate-900 text-white relative flex flex-col justify-between p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
            <Sparkles size={20} className="text-blue-400" fill="currentColor" />
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
              Work syncs <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">effortlessly.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Experience the future of team collaboration with AI-driven insights, seamless task management, and real-time communication.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-sm font-medium">Enterprise Grade Security</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Globe2 size={16} className="text-blue-400" />
                <span className="text-sm font-medium">Global Connectivity</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Area */}
        <div className="relative z-10 opacity-60 text-sm font-medium">
          © 2024 Collabryta Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="lg:w-1/2 bg-white flex flex-col justify-center items-center p-8 lg:p-12 relative">

        <div className="w-full max-w-[400px]">
          <motion.div
            initial={{ opacity: 0, x: 20 }} // Slide in from right slightly
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome back</h2>
              <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter your password"
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

              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign in
                    <ArrowUpRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700">
                  Sign up for free
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
