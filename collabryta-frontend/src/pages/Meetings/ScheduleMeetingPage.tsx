import React, { useState } from "react";
import {
  Calendar, Clock, FileText, ArrowLeft, CheckCircle2,
  Link as LinkIcon, Sparkles, Activity, Shield, Zap,
  Globe, Briefcase, Loader2, Video, ArrowUpRight, Plus,
  Info, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { meetingService } from "../../services/meetingService";

const ScheduleMeetingPage: React.FC = () => {
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState({
    title: "",
    date: "",
    time: "",
    end_time: "",
    notes: "",
    meeting_link: "",
    is_recurring_mon_fri: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meeting.title.trim() || !meeting.date || !meeting.time || !meeting.end_time) {
      return;
    }

    setLoading(true);
    try {
      const createMeetingData = (dateStr: string) => ({
        title: meeting.title,
        description: meeting.notes,
        start_time: new Date(`${dateStr}T${meeting.time}:00`).toISOString(),
        end_time: new Date(`${dateStr}T${meeting.end_time}:00`).toISOString(),
        meeting_link: meeting.meeting_link,
        location: "Virtual Meeting"
      });

      if (meeting.is_recurring_mon_fri) {
        const baseDate = new Date(meeting.date);
        const datesToCreate: string[] = [];
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(baseDate.setDate(diff));

        for (let i = 0; i < 5; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          datesToCreate.push(d.toISOString().split('T')[0]);
        }
        await Promise.all(datesToCreate.map(d => meetingService.createMeeting(createMeetingData(d))));
      } else {
        await meetingService.createMeeting(createMeetingData(meeting.date));
      }
      navigate("/meetings");
    } catch (error) {
      console.error("Failed to schedule meeting", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative">
      {/* Background Decor */}
      {/* Background Decor Removed */}

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate("/meetings")}
            className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-all font-bold text-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all hover:scale-110">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            Back to Meetings
          </button>

          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-[11px] uppercase tracking-widest border border-indigo-100 shadow-sm">
            <Video size={14} />
            Meeting Protocol
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Info */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">Schedule a Meeting</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Connect with your team by setting up a new session. Your team will receive notifications once the meeting is scheduled.
              </p>
            </div>

            <div className="glass-card rounded-[32px] p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100/50">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Secure Channel</h4>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">All meetings are encrypted and identity-verified.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Instant Sync</h4>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">Calendar invitations are automatically sent.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200 group hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Sparkles size={80} />
              </div>
              <h4 className="text-md font-bold mb-3 flex items-center gap-2"><Info size={16} className="text-indigo-400" /> Scheduling Tip</h4>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                Choose a title that clearly defines the purpose of your session for better attendance rates.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-bl-[100px] pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Meeting Title</label>
                  <input
                    type="text"
                    value={meeting.title}
                    onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
                    placeholder="e.g. Weekly Strategy Sync"
                    className="input-premium text-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
                      <input
                        type="date"
                        value={meeting.date}
                        onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
                        className="input-premium pl-14"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Start</label>
                      <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                        <input
                          type="time"
                          value={meeting.time}
                          onChange={(e) => setMeeting({ ...meeting, time: e.target.value })}
                          className="input-premium pl-12"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">End</label>
                      <div className="relative group">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={16} />
                        <input
                          type="time"
                          value={meeting.end_time}
                          onChange={(e) => setMeeting({ ...meeting, end_time: e.target.value })}
                          className="input-premium pl-12"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 rounded-[28px] border-2 transition-all cursor-pointer flex items-center justify-between gap-6 group ${meeting.is_recurring_mon_fri
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white shadow-xl shadow-indigo-200'
                    : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-white'
                    }`}
                  onClick={() => setMeeting({ ...meeting, is_recurring_mon_fri: !meeting.is_recurring_mon_fri })}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${meeting.is_recurring_mon_fri ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-white text-slate-400 border border-slate-200 shadow-sm group-hover:text-indigo-500 group-hover:scale-110'
                      }`}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className={`text-base font-bold mb-0.5 ${meeting.is_recurring_mon_fri ? 'text-white' : 'text-slate-900'}`}>Recurring Loop</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${meeting.is_recurring_mon_fri ? 'text-indigo-100' : 'text-slate-400'}`}>Schedule for Mon - Fri</p>
                    </div>
                  </div>
                  <div className={`w-14 h-8 relative rounded-full transition-all border ${meeting.is_recurring_mon_fri ? 'bg-indigo-700/50 border-white/20' : 'bg-slate-200 border-transparent'}`}>
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${meeting.is_recurring_mon_fri ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Meeting Link</label>
                  <div className="relative group">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="url"
                      value={meeting.meeting_link}
                      onChange={(e) => setMeeting({ ...meeting, meeting_link: e.target.value })}
                      placeholder="https://vc.example.com/stream/..."
                      className="input-premium pl-14 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Meeting Notes</label>
                  <textarea
                    value={meeting.notes}
                    onChange={(e) => setMeeting({ ...meeting, notes: e.target.value })}
                    rows={4}
                    placeholder="Briefly outline the goals for this session..."
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-[28px] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium text-slate-900 transition-all shadow-inner resize-none leading-relaxed hover:bg-white focus:bg-white"
                  />
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100 mt-10">
                  <button
                    type="button"
                    onClick={() => navigate("/meetings")}
                    className="w-full sm:w-auto px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-wider hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto btn-premium shadow-xl shadow-indigo-200 hover:shadow-indigo-300 min-w-[220px]"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Schedule Meeting
                        <ArrowUpRight size={20} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingPage;
