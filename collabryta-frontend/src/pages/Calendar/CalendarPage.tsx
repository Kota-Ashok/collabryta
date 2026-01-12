import React, { useState, useEffect } from "react";
import { meetingService } from "../../services/meetingService";
import {
  Calendar as CalendarIcon, Clock, MapPin,
  Video, ChevronLeft, ChevronRight,
  Loader2, Plus
} from "lucide-react";
import { motion } from "framer-motion";

interface CalendarEvent {
  id: string | number;
  title: string;
  time?: string;
  date: string;
  type: "meeting";
  status?: string;
  details?: string;
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const daysArray: number[] = [];
  for (let i = 1; i <= totalDays; i++) daysArray.push(i);

  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const meetings = await meetingService.getAllMeetings();

        const meetingEvents: CalendarEvent[] = meetings.map(m => {
          const start = new Date(m.start_time);
          const end = new Date(m.end_time);
          const timeStr = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

          return {
            id: `meeting-${m.id}`,
            title: m.title,
            time: timeStr,
            date: start.toLocaleDateString("en-CA"),
            type: "meeting",
            details: m.location || "Online"
          };
        });

        setEvents(meetingEvents);
      } catch (error) {
        console.error("Failed to fetch calendar data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedDateStr = selectedDate.toLocaleDateString("en-CA");
  const dayEvents = events.filter((e) => e.date === selectedDateStr);

  return (
    <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Calendar</h1>
            <p className="text-slate-500 font-medium text-sm">Keep track of your meetings.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-1.5 hover:shadow-md transition-shadow">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div className="px-6 min-w-[180px] text-center">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{monthNames[month]} {year}</span>
              </div>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(new Date());
              }}
              className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all whitespace-nowrap hidden sm:block"
            >
              Today
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2">
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-bold">Add Meeting</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 text-center font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] py-8 border-b border-slate-100">
              {daysOfWeek.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-slate-50 gap-px border-l border-t border-slate-100">
              {Array(startingDay).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white aspect-square" />
              ))}
              {daysArray.map((day) => {
                const d = new Date(year, month, day);
                const dateStr = d.toLocaleDateString("en-CA");
                const isTodayStr = dateStr === todayStr;
                const dateEvents = events.filter((e) => e.date === dateStr);
                const isSelected = dateStr === selectedDateStr;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`relative aspect-square p-2 lg:p-4 cursor-pointer transition-all bg-white hover:z-10 group ${isSelected ? 'ring-2 ring-inset ring-blue-500 z-10' : 'hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold flex items-center justify-center w-8 h-8 rounded-lg transition-all ${isSelected
                        ? 'text-blue-600 bg-blue-50'
                        : isTodayStr
                          ? 'text-white bg-blue-600 shadow-sm scale-110'
                          : 'text-slate-400 group-hover:text-slate-900'
                        }`}>{day}</span>
                      {dateEvents.length > 0 && !isSelected && !isTodayStr && (
                        <div className="flex gap-0.5">
                          {dateEvents.slice(0, 3).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-blue-200'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 overflow-hidden hidden sm:block">
                      {dateEvents.slice(0, 2).map((e, idx) => (
                        <div
                          key={idx}
                          className="text-[9px] font-bold truncate px-2 py-1 rounded-md flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          <div className="w-1 h-1 rounded-full bg-blue-500" />
                          {e.title}
                        </div>
                      ))}
                      {dateEvents.length > 2 && (
                        <div className="text-[9px] font-bold text-slate-300 pl-2">
                          + {dateEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* Fill remaining empty cells */}
              {Array(42 - startingDay - totalDays).fill(null).map((_, i) => (
                <div key={`empty-end-${i}`} className="bg-white aspect-square" />
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-fit">
            <div className="flex flex-col gap-6">
              <div className="px-2">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { day: 'numeric' })}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-medium text-slate-400">{selectedDate.toLocaleDateString('en-US', { month: 'long' })}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                </div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {loading ? (
                  <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading events...</p>
                  </div>
                ) : dayEvents.length > 0 ? (
                  <div className="space-y-4">
                    {dayEvents.map((event) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={event.id}
                        className="p-6 rounded-3xl border transition-all cursor-pointer group hover:scale-[1.02] bg-blue-50/50 text-slate-900 border-blue-100 ring-1 ring-blue-100"
                      >
                        <div className="flex items-start gap-5">
                          <div className="p-3.5 rounded-xl shadow-sm bg-white/20 text-white backdrop-blur-sm">
                            <Video size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">{event.type}</p>
                            </div>

                            <h4 className="text-sm font-bold leading-tight mb-3 line-clamp-2 tracking-tight">{event.title}</h4>
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100">
                                <Clock size={14} className="text-blue-300" />
                                {event.time}
                              </div>
                              {event.details && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-200">
                                  <MapPin size={14} className="text-blue-300" />
                                  {event.details}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <CalendarIcon className="text-slate-300" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Quiet day...</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">No scheduled events found.</p>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
