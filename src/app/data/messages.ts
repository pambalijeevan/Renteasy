import type { SessionUser } from './auth';
import type { Property } from './properties';

const THREADS_KEY = 'rentEasy_messageThreads';
const MESSAGES_KEY = 'rentEasy_messages';
export const MESSAGE_SYNC_EVENT = 'rentEasy:messagesUpdated';

export interface MessageThread {
  threadId: string;
  propertyId: string;
  propertyTitle: string;
  ownerEmail: string;
  ownerName: string;
  tenantEmail: string;
  tenantName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: 'owner' | 'tenant';
  senderEmail: string;
  text: string;
  timestamp: string;
  readBy: string[];
}

const emitSync = () => {
  window.dispatchEvent(new Event(MESSAGE_SYNC_EVENT));
};

const getThreads = (): MessageThread[] => {
  const raw = localStorage.getItem(THREADS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const getMessages = (): ChatMessage[] => {
  const raw = localStorage.getItem(MESSAGES_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveThreads = (threads: MessageThread[]) => {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
};

const saveMessages = (messages: ChatMessage[]) => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

const makeThreadId = (propertyId: string, ownerEmail: string, tenantEmail: string) =>
  `${propertyId}__${ownerEmail.toLowerCase()}__${tenantEmail.toLowerCase()}`;

export const getMessagesForThread = (threadId: string): ChatMessage[] => {
  return getMessages()
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getThreadByPropertyAndTenant = (propertyId: string, tenantEmail: string): MessageThread | null => {
  const thread = getThreads().find((t) => t.propertyId === propertyId && t.tenantEmail === tenantEmail);
  return thread || null;
};

export const getThreadsForUser = (user: SessionUser): MessageThread[] => {
  const threads = getThreads().filter((t) => (
    user.role === 'owner' ? t.ownerEmail === user.email : t.tenantEmail === user.email
  ));
  return threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const getOrCreateThread = (property: Property, tenantUser: SessionUser): MessageThread => {
  const threadId = makeThreadId(property.id, property.ownerEmail, tenantUser.email);
  const threads = getThreads();
  const existing = threads.find((t) => t.threadId === threadId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: MessageThread = {
    threadId,
    propertyId: property.id,
    propertyTitle: property.title,
    ownerEmail: property.ownerEmail,
    ownerName: property.ownerName,
    tenantEmail: tenantUser.email,
    tenantName: tenantUser.name,
    createdAt: now,
    updatedAt: now,
  };
  threads.push(created);
  saveThreads(threads);
  emitSync();
  return created;
};

export const sendThreadMessage = (
  threadId: string,
  sender: SessionUser,
  text: string
): ChatMessage | null => {
  const body = text.trim();
  if (!body) return null;

  const messages = getMessages();
  const threads = getThreads();
  const now = new Date().toISOString();
  const msg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    threadId,
    senderRole: sender.role,
    senderEmail: sender.email,
    text: body,
    timestamp: now,
    readBy: [sender.email],
  };
  messages.push(msg);

  const target = threads.find((t) => t.threadId === threadId);
  if (target) target.updatedAt = now;

  saveThreads(threads);
  saveMessages(messages);
  emitSync();
  return msg;
};

export const markThreadRead = (threadId: string, userEmail: string) => {
  const messages = getMessages();
  let changed = false;

  for (const msg of messages) {
    if (msg.threadId !== threadId) continue;
    if (!msg.readBy.includes(userEmail)) {
      msg.readBy.push(userEmail);
      changed = true;
    }
  }

  if (changed) {
    saveMessages(messages);
    emitSync();
  }
};

export const getUnreadCountForUser = (user: SessionUser): number => {
  return getMessages().filter((m) => (
    m.senderEmail !== user.email && !m.readBy.includes(user.email)
  )).length;
};

export const subscribeToMessageUpdates = (onUpdate: () => void): (() => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THREADS_KEY || event.key === MESSAGES_KEY) {
      onUpdate();
    }
  };
  const onLocal = () => onUpdate();

  window.addEventListener('storage', onStorage);
  window.addEventListener(MESSAGE_SYNC_EVENT, onLocal);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(MESSAGE_SYNC_EVENT, onLocal);
  };
};
