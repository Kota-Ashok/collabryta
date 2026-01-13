import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle,
    Clock,
    Plus,
    Trash2,
    Calendar,
    Filter,
    CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { taskService, Task } from "../../services/taskService";

const TasksPage: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

    const fetchTasks = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await taskService.getAllTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            if (showLoading) setLoading(false);
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
        return true;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50 border-red-100';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-zinc-500 bg-zinc-50 border-zinc-100';
        }
    }

    return (
        <div className="animate-in space-y-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Tasks</h1>
                        <p className="text-zinc-500 text-sm mt-1">Manage your daily objectives and assignments.</p>
                    </div>
                    <button
                        onClick={() => navigate("/tasks/add")}
                        className="btn-primary"
                    >
                        <Plus size={16} />
                        New Task
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-6 border-b border-zinc-200">
                    {[
                        { id: 'all', label: 'All Tasks' },
                        { id: 'today', label: 'Today' },
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'completed', label: 'Completed' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-zinc-900 text-zinc-900'
                                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-24 text-center">
                        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Loading tasks...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <motion.div
                                layout
                                key={task.id}
                                onClick={() => navigate(`/tasks/${task.id}`)}
                                className={`group bg-white p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer flex items-center gap-4 ${task.status === 'Completed' ? 'opacity-60 bg-zinc-50' : ''}`}
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(task); }}
                                    className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-colors border ${task.status === 'Completed'
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'bg-white border-zinc-300 text-transparent hover:border-emerald-500'
                                        }`}
                                >
                                    <CheckCircle size={14} fill="currentColor" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                            {task.priority || 'Medium'}
                                        </span>
                                        {task.start_date && (
                                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(task.start_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-sm font-medium text-zinc-900 ${task.status === 'Completed' ? 'line-through text-zinc-500' : ''}`}>{task.title}</h3>
                                    {task.description && <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{task.description}</p>}
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-16 text-center border border-dashed border-zinc-200 rounded-xl">
                                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-300">
                                    <CheckCircle2 size={20} />
                                </div>
                                <h3 className="text-sm font-medium text-zinc-900">No tasks found</h3>
                                <p className="text-xs text-zinc-500 mt-1">Clear your filters or create a new task.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksPage;
