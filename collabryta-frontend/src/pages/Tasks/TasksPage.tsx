import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    Clock,
    Plus,
    Trash2,
    Calendar,
    AlertCircle,
    User,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { taskService, Task } from "../../services/taskService";

const TasksPage: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const data = await taskService.getAllTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await taskService.deleteTask(id);
                setTasks(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task", error);
            }
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
            const updated = await taskService.updateTask(task.id, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    }

    const isToday = (dateString?: string) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    const isUpcoming = (dateString?: string) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today; // Including today? No, usually upcoming is after today.
    }

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'completed') return task.status === 'Completed';
        if (activeTab === 'today') {
            return task.status !== 'Completed' && (isToday(task.start_date) || isToday(task.end_date));
        }
        if (activeTab === 'upcoming') {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const taskDate = task.start_date ? new Date(task.start_date) : null;
            return task.status !== 'Completed' && taskDate && taskDate > today;
        }
        return true; // all
    });

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    }

    return (
        <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative">
            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Tasks</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your daily objectives and assignments.</p>
                    </div>
                    <button
                        onClick={() => navigate("/tasks/add")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                        <span className="font-bold">New Task</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'all', label: 'All Tasks' },
                        { id: 'today', label: 'Today' },
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'completed', label: 'Completed' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-24 text-center glass-card rounded-[40px]">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <motion.div
                                layout
                                key={task.id}
                                onClick={() => navigate(`/tasks/${task.id}`)}
                                className={`bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer ${task.status === 'Completed' ? 'opacity-60' : ''}`}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(task); }}
                                    className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all ${task.status === 'Completed'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-500 border border-slate-100'
                                        }`}
                                >
                                    <CheckCircle size={24} fill={task.status === 'Completed' ? "currentColor" : "none"} strokeWidth={task.status === 'Completed' ? 0 : 2} />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                        {task.start_date && (
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(task.start_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-lg font-bold text-slate-900 mb-1 ${task.status === 'Completed' ? 'line-through decoration-slate-300' : ''}`}>{task.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-1">{task.description}</p>
                                </div>

                                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-2xl transition-all shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-20 text-center glass-card rounded-[32px] border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <CheckCircle size={32} />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No tasks found in this section</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksPage;
