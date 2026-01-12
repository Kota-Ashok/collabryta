import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  ArrowRight,
  Video,
  Sparkles,
  ChevronRight,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { meetingService } from "../../services/meetingService";
import { messageService, Chat } from "../../services/messageService";
import { authService } from "../../services/authService";


interface DashboardEvent {
  id: string;
  title: string;
  time: string;
  type: "meeting";
  details?: string;
  timestamp: Date;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({
    meetingsToday: 0,
    unreadMessages: 0,
  });
  const [todaysEvents, setTodaysEvents] = useState<DashboardEvent[]>([]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [user, meetings, chats] = await Promise.all([
        authService.getCurrentUser(),
        meetingService.getAllMeetings(),
        messageService.getChats(),
      ]);

      setCurrentUser(user);

      const unreadCount = chats.reduce((acc: number, curr: Chat) => acc + (curr.unread_count || 0), 0);
      const todayStr = new Date().toLocaleDateString("en-CA");
      const todayMeetings = meetings.filter(m => new Date(m.start_time).toLocaleDateString("en-CA") === todayStr);

      setStats({
        meetingsToday: todayMeetings.length,
        unreadMessages: unreadCount,
      });

      const meetingEvents: DashboardEvent[] = todayMeetings.map(m => {
        const startDate = new Date(m.start_time);
        return {
          id: `meeting-${m.id}`,
          title: m.title,
          time: startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
          type: "meeting",
          details: m.location || "Virtual HQ",
          timestamp: startDate
        };
      });

      const allEvents = [...meetingEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setTodaysEvents(allEvents);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6 animate-pulse" />
        </div>
        <p className="mt-8 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing workspace</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Welcome Hero */}
      <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-md text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <Clock size={14} className="text-slate-500" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              Welcome back, {currentUser?.name?.split(' ')[0] || 'Member'}
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              You have <span className="text-slate-900 font-bold">{stats.meetingsToday} meetings</span> scheduled for today. Connect with your team seamlessly.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="Meetings Today"
          value={stats.meetingsToday}
          icon={Video}
          color="bg-blue-50 text-blue-600"
          onClick={() => navigate('/meetings')}
        />
        <StatCard
          label="Unread Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          color="bg-blue-50 text-blue-600"
          onClick={() => navigate('/messages')}
        />
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Schedule Timeline */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Today's Pulse</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Meeting Schedule</p>
            </div>
            <button
              onClick={() => navigate('/calendar')}
              className="group flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              System Calendar
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            {todaysEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {todaysEvents.map((event, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="p-6 flex items-center gap-8 hover:bg-slate-50 transition-all group cursor-pointer"
                    onClick={() => navigate('/meetings')}
                  >
                    <div className="w-20 text-center shrink-0">
                      <p className="text-xs font-bold text-slate-900 leading-none">{event.time.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{event.time.split(' ')[1] || ''}</p>
                    </div>

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-600 text-white shadow-sm">
                      <Video size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600">
                          {event.type}
                        </span>
                        {event.details && (
                          <span className="text-[10px] font-bold text-slate-400">• {event.details}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h4>
                    </div>

                    <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                      <ChevronRight size={18} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-24 text-center">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <CalendarIcon className="text-slate-300" size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900">No Meetings Today</h4>
                <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">Your calendar is clear</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Corporate Blue Stat Card
const StatCard = ({ label, value, icon: Icon, color = "bg-blue-50 text-blue-600", symbol = "", onClick }: any) => (
  <button
    onClick={onClick}
    className="group relative h-40 bg-white border border-slate-200 rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:border-blue-200 flex flex-col justify-between"
  >
    <div className="flex items-center justify-between w-full">
      <div className={`p-3 rounded-lg ${color} transition-colors`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={18} className="text-slate-400" />
      </div>
    </div>

    <div className="text-left">
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {symbol && <span className="text-sm font-bold text-slate-400">{symbol}</span>}
      </div>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  </button>
);

export default DashboardPage;



