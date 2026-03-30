import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Building2, MessageCircle, Send } from 'lucide-react';
import { getCurrentSession, subscribeToSessionUpdates, type SessionUser } from '../data/auth';
import {
  getMessagesForThread,
  getThreadsForUser,
  getUnreadCountForUser,
  markThreadRead,
  sendThreadMessage,
  subscribeToMessageUpdates,
  type MessageThread,
} from '../data/messages';

type LocationState = { threadId?: string };

export function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SessionUser | null>(() => getCurrentSession());
  const initialThreadId = useRef((location.state as LocationState | null)?.threadId || null);

  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [unreadCount, setUnreadCount] = useState(0);

  const backPath = user?.role === 'owner' ? '/owner/dashboard' : '/tenant/dashboard';

  useEffect(() => {
    const unsubscribe = subscribeToSessionUpdates(() => {
      setUser(getCurrentSession());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const refresh = () => {
      const list = getThreadsForUser(user);
      setThreads(list);
      setUnreadCount(getUnreadCountForUser(user));

      setActiveThreadId((prev) => {
        if (initialThreadId.current && list.some((t) => t.threadId === initialThreadId.current)) {
          const id = initialThreadId.current;
          initialThreadId.current = null;
          return id;
        }
        if (prev && list.some((t) => t.threadId === prev)) return prev;
        return list[0]?.threadId || null;
      });
    };

    refresh();
    const unsub = subscribeToMessageUpdates(refresh);
    return () => unsub();
  }, [navigate, user?.email, user?.role]);

  useEffect(() => {
    if (!user || !activeThreadId) return;
    markThreadRead(activeThreadId, user.email);
    setUnreadCount(getUnreadCountForUser(user));
  }, [activeThreadId, user?.email]);

  useEffect(() => {
    const fromNav = (location.state as LocationState | null)?.threadId;
    if (fromNav) {
      setActiveThreadId(fromNav);
    }
  }, [location.key, location.state]);

  if (!user) return null;

  const activeThread = threads.find((t) => t.threadId === activeThreadId) || null;
  const messages = activeThreadId ? getMessagesForThread(activeThreadId) : [];
  const draft = activeThreadId ? drafts[activeThreadId] || '' : '';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(backPath);
  };

  const handleSend = () => {
    if (!activeThreadId || !draft.trim()) return;
    sendThreadMessage(activeThreadId, user, draft);
    setDrafts((prev) => ({ ...prev, [activeThreadId]: '' }));
  };

  const setDraft = (value: string) => {
    if (!activeThreadId) return;
    setDrafts((prev) => ({ ...prev, [activeThreadId]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-orange-600" style={{ fontWeight: 700 }}>Rent Easy</span>
          </div>
          <div className="text-sm text-gray-700">
            <span style={{ fontWeight: 600 }}>Messages</span>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs" style={{ fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="text-gray-900" style={{ fontWeight: 700 }}>Conversations</h2>
            </div>
            {threads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No messages yet
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto">
                {threads.map((thread) => {
                  const threadMsgs = getMessagesForThread(thread.threadId);
                  const last = threadMsgs[threadMsgs.length - 1];
                  const unread = threadMsgs.filter(
                    (m) => m.senderEmail !== user.email && !m.readBy.includes(user.email)
                  ).length;
                  const otherName = user.role === 'owner' ? thread.tenantName : thread.ownerName;
                  return (
                    <button
                      key={thread.threadId}
                      onClick={() => setActiveThreadId(thread.threadId)}
                      className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                        activeThreadId === thread.threadId ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{otherName}</p>
                        {unread > 0 && (
                          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs" style={{ fontWeight: 700 }}>
                            {unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{thread.propertyTitle}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{last?.text || 'No messages yet'}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[70vh]">
            {activeThread ? (
              <>
                <div className="px-4 py-3 border-b bg-gray-50">
                  <p className="text-gray-900" style={{ fontWeight: 700 }}>
                    {user.role === 'owner' ? activeThread.tenantName : activeThread.ownerName}
                  </p>
                  <p className="text-xs text-gray-600">{activeThread.propertyTitle}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-orange-50/40">
                  {messages.map((message) => {
                    const own = message.senderEmail === user.email;
                    const isOwnerMsg = message.senderRole === 'owner';
                    const senderLabel = isOwnerMsg
                      ? `Owner • ${activeThread.ownerName}`
                      : `Tenant • ${activeThread.tenantName}`;
                    return (
                      <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-3 py-2 border shadow-sm ${
                          isOwnerMsg
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-blue-100 text-blue-900 border-blue-200'
                        }`}>
                          <p
                            className={`text-[11px] mb-1 ${isOwnerMsg ? 'text-amber-700' : 'text-blue-700'}`}
                            style={{ fontWeight: 700 }}
                          >
                            {senderLabel}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <p className={`text-[11px] mt-1 ${isOwnerMsg ? 'text-amber-700' : 'text-blue-700'}`}>
                            {new Date(message.timestamp).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t bg-white flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 flex items-center gap-1.5 text-sm"
                    style={{ fontWeight: 700 }}
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <MessageCircle className="w-10 h-10 mb-2 text-gray-300" />
                Select a conversation
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
