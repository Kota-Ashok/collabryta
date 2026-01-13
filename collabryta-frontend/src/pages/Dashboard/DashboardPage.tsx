import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Video,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { meetingService, Meeting } from "../../services/meetingService";
import { messageService, Chat } from "../../services/messageService";
import { taskService, Task } from "../../services/taskService";
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
    taskCompletion: "0/0",
    tasksDueToday: 0,
    pendingTasksCount: 0
  });
  const [todaysEvents, setTodaysEvents] = useState<DashboardEvent[]>([]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [user, meetings, chats, tasks] = await Promise.all([
        authService.getCurrentUser(),
        meetingService.getAllMeetings(),
        messageService.getChats(),
        taskService.getAllTasks(),
      ]);

      setCurrentUser(user);

      const unreadCount = chats.reduce((acc: number, curr: Chat) => acc + (curr.unread_count || 0), 0);
      const todayStr = new Date().toLocaleDateString("en-CA");
      const todayMeetings = meetings.filter(m => new Date(m.start_time).toLocaleDateString("en-CA") === todayStr);

      const pendingTasks = tasks.filter(t => t.status !== "Completed").length;
      const tasksDueToday = tasks.filter(t => t.end_date && new Date(t.end_date).toLocaleDateString("en-CA") === todayStr).length;

      setStats({
        meetingsToday: todayMeetings.length,
        unreadMessages: unreadCount,
        taskCompletion: pendingTasks.toString(), // Keeping format for compatibility if needed, but mostly using count
        pendingTasksCount: pendingTasks,
        tasksDueToday: tasksDueToday
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
    }, 60000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-400">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mb-4" />
        <p className="text-xs font-medium uppercase tracking-wider">Loading Dashboard</p>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tasks/add')}
            className="btn-secondary text-xs"
          >
            <Plus size={14} />
            New Task
          </button>
          <button
            onClick={() => navigate('/meetings/schedule')}
            className="btn-primary text-xs"
          >
            <Plus size={14} />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Meetings Today"
          value={stats.meetingsToday}
          icon={Video}
          onClick={() => navigate('/meetings')}
        />
        <StatCard
          label="Unread Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          highlight={stats.unreadMessages > 0}
          onClick={() => navigate('/messages')}
        />
        <StatCard
          label="Tasks Due Today"
          value={stats.tasksDueToday}
          icon={Clock}
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingTasksCount}
          icon={CheckCircle2}
          onClick={() => navigate('/tasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-900">Today's Schedule</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              View Calendar <ArrowRight size={12} />
            </button>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-h-[300px]">
            {todaysEvents.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {todaysEvents.map((event, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/meetings')}
                  >
                    <div className="w-16 text-center shrink-0">
                      <p className="text-sm font-semibold text-zinc-900">{event.time.split(' ')[0]}</p>
                      <p className="text-[10px] font-medium text-zinc-400 uppercase">{event.time.split(' ')[1]}</p>
                    </div>

                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                      <Video size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-900 truncate">{event.title}</h4>
                      <p className="text-xs text-zinc-500 truncate">{event.details}</p>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
                      <ArrowRight size={16} className="text-zinc-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                  <CalendarIcon className="text-zinc-300" size={20} />
                </div>
                <h3 className="text-sm font-medium text-zinc-900">No meetings scheduled</h3>
                <p className="text-xs text-zinc-500 mt-1">Enjoy your focused time today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content: Quick Actions / Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-zinc-900">Quick Access</h2>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4 space-y-2">
            <QuickAccessItem
              icon={MessageSquare}
              label="Team Chat"
              desc="Connect with your team"
              onClick={() => navigate('/messages')}
            />
            <QuickAccessItem
              icon={CheckCircle2}
              label="My Tasks"
              desc="Review pending items"
              onClick={() => navigate('/tasks')}
            />
            <QuickAccessItem
              icon={CalendarIcon}
              label="Calendar"
              desc="Check upcoming events"
              onClick={() => navigate('/calendar')}
            />
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-white mt-6 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-semibold mb-1">Pro Tip</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Keep your inbox zero by archiving old messages. A clean workspace is a productive one.
              </p>
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-zinc-800 rounded-full blur-2xl opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, highlight = false, onClick }: any) => (
  <button
    onClick={onClick}
    className={`p-6 rounded-xl border text-left transition-all duration-200 hover:shadow-md flex flex-col justify-between h-32 ${highlight
        ? "bg-zinc-900 border-zinc-900 text-white"
        : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
  >
    <div className="flex justify-between items-start w-full">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
        <Icon size={18} className={highlight ? "text-zinc-300" : "text-zinc-500"} />
      </div>
      {/* <MoreHorizontal size={16} className={highlight ? "text-zinc-500" : "text-zinc-300"} /> */}
    </div>

    <div>
      <h3 className={`text-2xl font-bold tracking-tight ${highlight ? "text-white" : "text-zinc-900"}`}>
        {value}
      </h3>
      <p className={`text-xs font-medium mt-1 ${highlight ? "text-zinc-400" : "text-zinc-500"}`}>
        {label}
      </p>
    </div>
  </button>
);

const QuickAccessItem = ({ icon: Icon, label, desc, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors text-left group"
  >
    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-colors">
      <Icon size={16} />
    </div>
    <div>
      <h4 className="text-sm font-medium text-zinc-900">{label}</h4>
      <p className="textxs text-zinc-500">{desc}</p>
    </div>
    <ArrowRight size={14} className="ml-auto text-zinc-300 group-hover:text-zinc-500" />
  </button>
);

export default DashboardPage;
