import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Search, Users, Paperclip, Send,
    X, Plus, MessageSquare as MessageIcon,
    ArrowLeft, Phone, Video, MoreVertical,
    Check
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
                        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-xl border border-zinc-200 w-full max-w-md p-6 relative z-10 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-zinc-900">New Group</h3>
                            <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-md text-zinc-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">Group Name</label>
                                <input
                                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none transition-all"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    placeholder="Enter group name..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wider">Select Members</label>
                                <div className="max-h-[240px] overflow-y-auto border border-zinc-200 rounded-xl divide-y divide-zinc-50 custom-scrollbar">
                                    {users.map((u: User) => (
                                        <button
                                            key={u.id}
                                            onClick={() => toggleUser(u.id)}
                                            className={`w-full flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors text-left group ${selectedIds.includes(u.id) ? 'bg-zinc-50/50' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${selectedIds.includes(u.id) ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-300 text-transparent group-hover:border-zinc-400'}`}>
                                                <Check size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-zinc-900 block">{u.name}</span>
                                                <span className="text-xs text-zinc-400">User</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!groupName || selectedIds.length === 0}
                                className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 mt-2 shadow-lg shadow-zinc-900/10 transition-all"
                            >
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
        }, 8000); // Poll every 8s

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
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden animate-in">
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                users={allUsers}
                onCreate={handleCreateGroup}
            />

            {/* Sidebar List */}
            <div className={`w-full md:w-80 border-r border-zinc-100 flex flex-col bg-white ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 flex justify-between items-center border-b border-zinc-50">
                    <div>
                        <h2 className="font-bold text-zinc-900 tracking-tight">Messages</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Online</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-all"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="p-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 transition-colors" size={14} />
                        <input
                            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 outline-none transition-all placeholder:text-zinc-400"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
                    {filteredChats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => {
                                setActiveChatId(chat.id);
                                setIsMobileChatOpen(true);
                            }}
                            className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${activeChatId === chat.id
                                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10'
                                    : 'hover:bg-zinc-50 text-zinc-700'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${activeChatId === chat.id ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                {chat.is_group ? <Users size={16} /> : chat.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-baseline">
                                    <span className={`text-sm font-semibold truncate ${activeChatId === chat.id ? 'text-white' : 'text-zinc-900'}`}>
                                        {chat.name}
                                    </span>
                                    {chat.last_message_time && (
                                        <span className={`text-[10px] ${activeChatId === chat.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                            {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs truncate mt-0.5 ${activeChatId === chat.id ? 'text-zinc-400' : 'text-zinc-500 transition-colors'}`}>
                                    {chat.last_message || "No messages yet"}
                                </p>
                            </div>
                        </button>
                    ))}

                    {suggestedUsers.length > 0 && (
                        <div className="pt-4 pb-2 px-2">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Suggested</p>
                            {suggestedUsers.map(user => (
                                <button key={user.id} onClick={() => handleCreateP2PChat(user.id)} className="w-full p-2 hover:bg-zinc-50 rounded-lg flex items-center gap-3 text-left group">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs text-zinc-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-zinc-200">
                                        {user.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700">{user.name}</span>
                                    <Plus size={14} className="ml-auto text-zinc-300 group-hover:text-zinc-600" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeChat ? (
                <div className={`flex-1 flex flex-col relative ${isMobileChatOpen ? 'flex absolute inset-0 z-20 bg-white' : 'hidden md:flex'}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-zinc-50/30 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                    {/* Chat Header */}
                    <div className="h-16 px-6 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMobileChatOpen(false)} className="md:hidden p-1 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
                                <ArrowLeft size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-sm text-zinc-700 border border-zinc-200">
                                {activeChat.is_group ? <Users size={18} /> : activeChat.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900 leading-tight">{activeChat.name}</h2>
                                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Active Now
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"><Phone size={18} /></button>
                            <button className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"><Video size={18} /></button>
                            <div className="w-px h-6 bg-zinc-200 mx-1" />
                            <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"><MoreVertical size={18} /></button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-hidden relative">
                        <div ref={messagesContainerRef} className="absolute inset-0 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    return (
                                        <motion.div
                                            key={msg.id || idx}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] font-bold text-zinc-400 ml-3 mb-1 uppercase tracking-wide">
                                                        {allUsers.find(u => u.id === msg.sender_id)?.name.split(' ')[0]}
                                                    </span>
                                                )}
                                                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${isMe
                                                        ? 'bg-zinc-900 text-white rounded-tr-sm'
                                                        : 'bg-white text-zinc-800 border border-zinc-200 rounded-tl-sm'
                                                    }`}>
                                                    {msg.content}
                                                    <span className={`text-[9px] absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div className="h-4" /> {/* Spacer */}
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-zinc-200 relative z-20">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end gap-2 bg-zinc-50 border border-zinc-200 p-2 rounded-2xl focus-within:ring-2 focus-within:ring-zinc-900/5 focus-within:border-zinc-300 transition-all shadow-sm">
                            <button type="button" className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-xl transition-colors shrink-0">
                                <Plus size={20} />
                            </button>
                            <div className="flex-1 py-2">
                                <input
                                    className="w-full bg-transparent border-none outline-none text-sm text-zinc-900 placeholder:text-zinc-400 resize-none font-medium"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {inputText.trim() ? (
                                    <button type="submit" className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-md active:scale-95">
                                        <Send size={18} className="translate-x-0.5 translate-y-px" />
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 rounded-xl transition-colors">
                                            <Paperclip size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-zinc-50/30 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-50" />
                    <div className="p-8 rounded-full bg-white shadow-lg shadow-zinc-200/50 mb-6 border border-zinc-100 animate-in zoom-in duration-500">
                        <MessageIcon size={48} className="text-zinc-900" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">Your Messages</h3>
                    <p className="text-sm text-zinc-500 mt-2 max-w-xs text-center font-medium">
                        Select a chat from the sidebar to start noticing real-time collaboration.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
