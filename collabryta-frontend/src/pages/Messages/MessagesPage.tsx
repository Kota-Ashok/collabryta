import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Search, Users, Paperclip, Smile, Send,
    Check, ArrowLeft, X, Sparkles, Zap, Shield, Plus, ArrowUpRight, ChevronRight, MessageSquare as MessageIcon
} from "lucide-react";
import { messageService, Chat, Message } from "../../services/messageService";
import { userService, User } from "../../services/userService";
import { authService } from "../../services/authService";

import { motion, AnimatePresence } from "framer-motion";

const CreateGroupModal = ({ isOpen, onClose, users, onCreate }: any) => {
    const [groupName, setGroupName] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleUser = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = () => {
        if (!groupName || selectedIds.length === 0) return;
        onCreate(groupName, selectedIds);
        onClose();
        setGroupName("");
        setSelectedIds([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-[32px] border border-slate-100 w-full max-w-md p-8 relative z-10 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900">Create Group</h3>
                                <p className="text-sm text-slate-500 font-medium">Start a new team conversation</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Group Name</label>
                                <input
                                    className="input-field"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    placeholder="Enter group name..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Select Members</label>
                                <div className="max-h-[250px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                    {users.map((u: User) => (
                                        <button
                                            key={u.id}
                                            onClick={() => toggleUser(u.id)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${selectedIds.includes(u.id) ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-transparent hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-sm ${selectedIds.includes(u.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className={`text-sm font-semibold ${selectedIds.includes(u.id) ? 'text-blue-600' : 'text-slate-700'}`}>{u.name}</span>
                                            {selectedIds.includes(u.id) && (
                                                <div className="ml-auto p-1 bg-blue-600 rounded-lg text-white">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!groupName || selectedIds.length === 0}
                                className="btn-primary w-full shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none mt-4"
                            >
                                <Plus size={18} />
                                Create Group
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const MessagesPage: React.FC = () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [inputText, setInputText] = useState("");
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const loadChats = useCallback(async () => {
        try {
            const data = await messageService.getChats();
            setChats(data);
        } catch (e) {
            console.error("Failed to load chats:", e);
        }
    }, []);

    const loadUserAndData = useCallback(async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            await loadChats();
            const users = await userService.getAllUsers();
            setAllUsers(users.filter(u => u.id !== user.id));
        } catch (e) {
            console.error("Failed to load user data:", e);
        }
    }, [loadChats]);

    const loadMessages = useCallback(async (chatId: number) => {
        try {
            const msgs = await messageService.getMessages(chatId);
            setMessages(msgs);
            await messageService.markAsRead(chatId);
            loadChats();
        } catch (e) {
            console.error("Failed to load messages:", e);
        }
    }, [loadChats]);

    const scrollToBottom = useCallback((smooth = true) => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }, []);

    useEffect(() => {
        loadUserAndData();
    }, [loadUserAndData]);

    useEffect(() => {
        const pollInterval = setInterval(() => {
            loadChats();
            if (activeChatId) {
                loadMessages(activeChatId);
            }
        }, 10000);

        return () => {
            clearInterval(pollInterval);
        };
    }, [activeChatId, loadChats, loadMessages]);

    useEffect(() => {
        if (activeChatId) {
            loadMessages(activeChatId);
            setTimeout(() => scrollToBottom(false), 100);
        }
    }, [activeChatId, loadMessages, scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeChatId) return;
        try {
            await messageService.sendMessage(activeChatId, inputText);
            setInputText("");
            loadMessages(activeChatId);
            loadChats();
            setTimeout(() => scrollToBottom(), 100);
        } catch (e) {
            console.error("Failed to send message:", e);
        }
    };

    const handleCreateP2PChat = async (userId: number) => {
        try {
            const chat = await messageService.createChat([userId], undefined, false);
            setChats(prev => prev.find(c => c.id === chat.id) ? prev : [chat, ...prev]);
            setActiveChatId(chat.id);
            setIsMobileChatOpen(true);
            setSearchQuery("");
        } catch (e) {
            console.error("Failed to create P2P chat:", e);
        }
    };

    const handleCreateGroup = async (name: string, userIds: number[]) => {
        try {
            const chat = await messageService.createChat(userIds, name, true);
            setChats(prev => [chat, ...prev]);
            setActiveChatId(chat.id);
            setIsMobileChatOpen(true);
        } catch (e) {
            console.error("Failed to create group chat:", e);
        }
    };

    const filteredChats = chats.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const suggestedUsers = searchQuery ? allUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className="flex h-[80vh] bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden mx-4 my-6 animate-fade-in font-sans">
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                users={allUsers}
                onCreate={handleCreateGroup}
            />

            {/* Sidebar (Chat List) */}
            <div className={`w-full md:w-[320px] lg:w-[380px] bg-white border-r border-slate-100 flex flex-col ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1">Messages</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            System Active
                        </p>
                    </div>
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                        title="New Group"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="px-4 py-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-blue-500/20 focus:ring-2 focus:ring-blue-100/50 transition-all outline-none font-semibold text-slate-900 text-sm placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
                    {filteredChats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                setActiveChatId(chat.id);
                                setIsMobileChatOpen(true);
                            }}
                            className={`p-3 mb-1 rounded-2xl cursor-pointer transition-all border ${activeChatId === chat.id
                                ? 'bg-blue-50 text-slate-900 border-blue-100 shadow-sm'
                                : 'bg-transparent hover:bg-slate-50 border-transparent hover:border-slate-100 text-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${activeChatId === chat.id
                                    ? 'bg-white text-blue-600 border border-blue-100 shadow-sm'
                                    : 'bg-white border border-slate-100 text-slate-500'
                                    }`}>
                                    {chat.is_group ? <Users size={16} /> : chat.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className={`text-sm font-bold truncate ${activeChatId === chat.id ? 'text-blue-900' : 'text-slate-900'}`}>
                                            {chat.name}
                                        </h3>
                                        {chat.last_message_time && (
                                            <span className={`text-[10px] font-bold ${activeChatId === chat.id ? 'text-blue-400' : 'text-slate-400'}`}>
                                                {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate font-medium ${activeChatId === chat.id ? 'text-blue-600/80' : 'text-slate-400'}`}>
                                        {chat.last_message || "No messages yet"}
                                    </p>
                                </div>
                                {(chat.unread_count || 0) > 0 && (
                                    <div className={`w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 ${activeChatId === chat.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-600 text-white shadow-sm'
                                        }`}>
                                        {chat.unread_count}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Suggestions Section styling updated for compactness */}
                    {suggestedUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 mx-2">
                            <h4 className="px-2 mb-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Suggested</h4>
                            {suggestedUsers.map(user => (
                                <button key={user.id} onClick={() => handleCreateP2PChat(user.id)} className="w-full p-2 rounded-xl hover:bg-slate-50 flex items-center gap-3 group transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{user.name.substring(0, 2).toUpperCase()}</div>
                                    <span className="text-xs font-bold text-slate-700 flex-1 text-left">{user.name}</span>
                                    <Plus size={14} className="text-slate-300 group-hover:text-blue-600" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeChat ? (
                <div className={`flex-1 flex flex-col relative bg-slate-50/50 ${isMobileChatOpen ? 'flex absolute inset-0 z-30 bg-white' : 'hidden md:flex'}`}>

                    {/* Chat Header */}
                    <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsMobileChatOpen(false)} className="md:hidden p-2 -ml-2 text-slate-500">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-slate-900 text-white shadow-md">
                                {activeChat.is_group ? <Users size={16} /> : activeChat.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 leading-tight">{activeChat.name}</h2>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                    Connected
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <Shield size={14} />
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-hidden relative">
                        {/* Messages List */}
                        <div ref={messagesContainerRef} className="absolute inset-0 overflow-y-auto p-6 space-y-4 custom-scrollbar scroll-smooth">
                            <AnimatePresence mode="popLayout">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    return (
                                        <motion.div
                                            key={msg.id || idx}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                                {!isMe && (
                                                    <span className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase tracking-wide">
                                                        {allUsers.find(u => u.id === msg.sender_id)?.name.split(' ')[0]}
                                                    </span>
                                                )}
                                                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm relative ${isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-300 mt-1 mx-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-slate-100 z-20">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Write a message..."
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 transition-colors">
                                    <Paperclip size={16} />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50/50 text-center p-12">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200 border border-slate-100 rotate-3">
                        <MessageIcon className="text-blue-500" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Conversation</h3>
                    <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed uppercase tracking-wide">
                        Choose a chat from the sidebar to start collaborating with your team.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
