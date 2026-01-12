import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Calendar,
    Clock,
    User,
    AlignLeft,
    Type,
    Check,
    ArrowLeft,
    Sparkles,
    Trash2
} from "lucide-react";
import { taskService, Task } from "../../services/taskService";
import { userService, User as IUser } from "../../services/userService";

const EditTaskPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [users, setUsers] = useState<IUser[]>([]);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        assignedTo: "",
        priority: "Medium",
        status: "Pending"
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [usersData, meData, taskData] = await Promise.all([
                    userService.getAllUsers(),
                    userService.getMe(),
                    taskService.getTask(parseInt(id))
                ]);
                setUsers(usersData);
                setCurrentUser(meData);

                if (taskData) {
                    // Parse dates
                    let startDate = "";
                    let startTime = "";
                    if (taskData.start_date) {
                        const d = new Date(taskData.start_date);
                        startDate = d.toISOString().split('T')[0];
                        startTime = d.toTimeString().slice(0, 5);
                    }

                    let endDate = "";
                    let endTime = "";
                    if (taskData.end_date) {
                        const d = new Date(taskData.end_date);
                        endDate = d.toISOString().split('T')[0];
                        endTime = d.toTimeString().slice(0, 5);
                    }

                    setFormData({
                        title: taskData.title,
                        description: taskData.description || "",
                        startDate,
                        startTime,
                        endDate,
                        endTime,
                        assignedTo: taskData.assigned_to_id ? taskData.assigned_to_id.toString() : (taskData.owner_id.toString()),
                        priority: taskData.priority || "Medium",
                        status: taskData.status || "Pending"
                    });
                }
            } catch (e) {
                console.error(e);
                navigate("/tasks");
            } finally {
                setFetching(false);
            }
        }
        fetchData();
    }, [id, navigate]);

    const handleAssignToMe = () => {
        if (currentUser) {
            setFormData(prev => ({ ...prev, assignedTo: currentUser.id.toString() }));
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this task?")) {
            try {
                if (id) await taskService.deleteTask(parseInt(id));
                navigate("/tasks");
            } catch (e) {
                console.error(e);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setLoading(true);

        try {
            // Combine date and time
            let startISO = undefined;
            let endISO = undefined;

            if (formData.startDate) {
                const d = new Date(formData.startDate + "T" + (formData.startTime || "09:00"));
                startISO = d.toISOString();
            }
            if (formData.endDate) {
                const d = new Date(formData.endDate + "T" + (formData.endTime || "17:00"));
                endISO = d.toISOString();
            }

            await taskService.updateTask(parseInt(id), {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                start_date: startISO,
                end_date: endISO,
                assigned_to_id: formData.assignedTo ? parseInt(formData.assignedTo) : undefined
            });
            navigate("/tasks");
        } catch (error) {
            console.error("Failed to update task", error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="min-h-screen text-slate-900 pb-20 animate-fade-in relative flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Edit Task</h1>
                            <p className="text-slate-500 font-medium">Update assignment details.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleDelete}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                        <Trash2 size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Title */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Type size={14} /> Heading
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Update Client Proposal"
                            className="w-full text-xl font-bold text-slate-900 placeholder:text-slate-300 border-none bg-slate-50/50 rounded-2xl p-6 focus:ring-2 focus:ring-blue-100 transition-all"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <AlignLeft size={14} /> Content
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add details details..."
                            rows={4}
                            className="w-full font-medium text-slate-700 placeholder:text-slate-300 border-none bg-slate-50/50 rounded-2xl p-6 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 appearance-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Priority
                            </label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 appearance-none"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates & Times */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Start Date
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-100"
                                />
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-24 font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} /> End Date
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-100"
                                />
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-24 font-bold text-slate-700 bg-slate-50/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Assign To
                            </label>
                            <button
                                type="button"
                                onClick={handleAssignToMe}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-wider flex items-center gap-1"
                            >
                                <Sparkles size={12} /> Assign to me
                            </button>
                        </div>

                        <select
                            value={formData.assignedTo}
                            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                            className="w-full font-bold text-slate-700 bg-slate-50/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 appearance-none"
                        >
                            <option value="">Select Member...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 mt-4"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                        {!loading && <Check size={24} strokeWidth={3} />}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default EditTaskPage;
