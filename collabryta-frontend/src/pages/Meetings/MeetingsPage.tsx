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
  PlayCircle,
  MoreHorizontal
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
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
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
    return getStatus(m.start_time, m.end_time) === 'upcoming';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastMeetings = meetings.filter(m => {
    return getStatus(m.start_time, m.end_time) === 'past';
  }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const currentOrNext = presentMeetings.length > 0 ? presentMeetings[0] : (upcomingMeetings.find(m => isToday(m.start_time)) || null);

  return (
    <div className="animate-in space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Meetings</h1>
            <p className="text-zinc-500 text-sm mt-1">Coordinate and join your team synchronization sessions.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/calendar")}
              className="btn-secondary"
            >
              <Calendar size={16} />
              Calendar
            </button>
            <button
              onClick={() => navigate("/meetings/schedule")}
              className="btn-primary"
            >
              <Plus size={16} />
              Schedule Meeting
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Loading meetings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Column: Main Feed */}
            <div className="lg:col-span-2 space-y-8">
              {/* Highlight Card */}
              <AnimatePresence mode="wait">
                {currentOrNext && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${getStatus(currentOrNext.start_time, currentOrNext.end_time) === 'present'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                          {getStatus(currentOrNext.start_time, currentOrNext.end_time) === 'present' ? (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                              </span>
                              Live Now
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              Up Next
                            </>
                          )}
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900">{currentOrNext.title}</h2>
                        <p className="text-zinc-500 text-sm mt-1">{formatDate(currentOrNext.start_time)} • {formatTime(currentOrNext.start_time)}</p>
                      </div>

                      {currentOrNext.meeting_link && (
                        <button
                          onClick={() => window.open(currentOrNext.meeting_link, '_blank')}
                          className="btn-primary text-xs"
                        >
                          Join <PlayCircle size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-6 pt-6 border-t border-zinc-100">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Users size={16} className="text-zinc-400" />
                        <span>{currentOrNext.participants?.length || 0} attendees</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <MapPin size={16} className="text-zinc-400" />
                        <span>{currentOrNext.location || "Virtual"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upcoming List */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                  Upcoming
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">{upcomingMeetings.length}</span>
                </h3>

                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMeetings.map((m) => (
                      <div
                        key={m.id}
                        className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all flex items-center gap-4 group"
                      >
                        <div className="w-16 text-center shrink-0">
                          <p className="text-sm font-semibold text-zinc-900">{formatTime(m.start_time)}</p>
                          <p className="text-[10px] uppercase text-zinc-400 font-medium">{formatDate(m.start_time).split(',')[0]}</p>
                        </div>

                        <div className="w-px h-8 bg-zinc-100" />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-zinc-900 truncate">{m.title}</h4>
                          <p className="text-xs text-zinc-500 truncate">{m.location || 'Online'}</p>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.meeting_link && (
                            <button onClick={() => window.open(m.meeting_link, '_blank')} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <ExternalLink size={16} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(m.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-zinc-200 rounded-xl">
                    <p className="text-sm text-zinc-500">No upcoming meetings scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: History */}
            <div className="space-y-6">
              <div className="bg-zinc-50/50 rounded-xl border border-zinc-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-zinc-900">Recent History</h3>
                </div>

                <div className="space-y-4">
                  {pastMeetings.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-start gap-3 group">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-zinc-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-700 line-through decoration-zinc-300">{m.title}</p>
                        <p className="text-xs text-zinc-400">{formatDate(m.start_time)}</p>
                      </div>
                    </div>
                  ))}
                  {pastMeetings.length === 0 && (
                    <p className="text-xs text-zinc-400 italic">No meeting history available.</p>
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
