import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  Video,
  History,
  MapPin,
  ChevronRight,
  Loader2,
  PlayCircle,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { meetingService, Meeting } from "../../services/meetingService";


const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchMeetings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await meetingService.getAllMeetings();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMeetings();
    const pollInterval = setInterval(() => {
      fetchMeetings(false);
    }, 60000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        await meetingService.deleteMeeting(id);
        setMeetings(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error("Failed to delete meeting", error);
      }
    }
  };

  const getStatus = (start: string, end: string) => {
    const now = currentTime;
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (now >= startTime && now <= endTime) return 'present';
    if (now > endTime) return 'past';
    return 'upcoming';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  };

  const presentMeetings = meetings.filter(m => getStatus(m.start_time, m.end_time) === 'present');
  const upcomingMeetings = meetings.filter(m => {
    return getStatus(m.start_time, m.end_time) === 'upcoming' && isToday(m.start_time);
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastMeetings = meetings.filter(m => {
    if (getStatus(m.start_time, m.end_time) !== 'past') return false;
    const endTime = new Date(m.end_time);
    const fortyEightHoursAgo = new Date(currentTime.getTime() - (48 * 60 * 60 * 1000));
    return endTime > fortyEightHoursAgo;
  }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const currentOrNext = presentMeetings.length > 0 ? presentMeetings[0] : (upcomingMeetings.length > 0 ? upcomingMeetings[0] : null);

  return (
    <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative">
      {/* Background Decor */}
      {/* Background Decor Removed */}

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Meetings</h1>
            <p className="text-slate-500 font-medium text-sm">Coordinate and join your team synchronization sessions.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/calendar")}
              className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all hover:border-slate-300"
            >
              Calendar View
            </button>
            <button
              onClick={() => navigate("/meetings/schedule")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-bold">Schedule Meeting</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center glass-card rounded-[40px]">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-6" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing meeting timeline...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left/Middle Column: Main Feed */}
            <div className="lg:col-span-8 space-y-10">
              {/* Highlight Card */}
              <AnimatePresence mode="wait">
                {currentOrNext ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white text-slate-900 p-10 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-200 group"
                  >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <Video size={240} className="text-slate-900" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${presentMeetings.length > 0 ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                          }`}>
                          {presentMeetings.length > 0 ? "Live Session" : "Starting Soon"}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <Clock size={14} />
                          {formatTime(currentOrNext.start_time)}
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 leading-tight">{currentOrNext.title}</h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pb-10 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100">
                            <Users size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                            <p className="text-xs font-bold">{currentOrNext.participants?.length || 0} Operatives</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100">
                            <MapPin size={22} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                            <p className="text-xs font-bold truncate max-w-[200px]">{currentOrNext.location || "Virtual Access"}</p>
                          </div>
                        </div>
                      </div>

                      {currentOrNext.meeting_link && (
                        <button
                          onClick={() => window.open(currentOrNext.meeting_link, '_blank')}
                          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg shadow-blue-200 group/btn"
                        >
                          Join Meeting Now
                          <PlayCircle size={20} className="text-blue-200 fill-white/20" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-16 text-center glass-card rounded-[40px]">
                    <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-sm">
                      <Calendar className="text-slate-300" size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No active or upcoming sessions today</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Today's Timeline */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
                  <div className="h-0.5 flex-1 mx-6 bg-slate-100 rounded-full hidden sm:block" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{upcomingMeetings.length} Sessions</p>
                </div>

                {upcomingMeetings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {upcomingMeetings.map((m) => (
                      <motion.div
                        layout
                        key={m.id}
                        className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all cursor-pointer relative"
                      >
                        <div className="w-28 shrink-0 px-5 py-3 bg-slate-50 rounded-[20px] text-center group-hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:border-indigo-100/50">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{formatTime(m.start_time)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-3">{m.title}</h4>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                              <Users size={14} className="text-slate-300" />
                              {m.participants?.length || 0}
                            </span>
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate max-w-[150px]">
                              <MapPin size={14} className="text-slate-300" />
                              {m.location || "Online"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-all">
                          {m.meeting_link && (
                            <button
                              onClick={() => window.open(m.meeting_link, '_blank')}
                              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                            >
                              <ExternalLink size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center glass-card rounded-[32px] border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your timeline is clear move objectives forward</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Side Info */}
            <div className="lg:col-span-4 space-y-10">


              {/* History Section */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent History</h3>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest flex items-center gap-1 group/link">
                    View All <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="space-y-3">
                  {pastMeetings.slice(0, 5).map(m => (
                    <motion.div
                      layout
                      key={m.id}
                      className="p-4 bg-slate-50/50 rounded-[24px] border border-slate-100 flex items-center justify-between group hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[18px] bg-white flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all border border-slate-100">
                          <History size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[140px] group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{formatDate(m.start_time).split(',')[0]}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 border border-slate-100">
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                  {pastMeetings.length === 0 && (
                    <div className="p-10 text-center glass-card rounded-[32px] border-dashed border-slate-200">
                      <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">No past records</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
