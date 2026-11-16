import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Send,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import {
  notifyChatStartedViaAppsScript,
  notifyMeetingRequestedViaAppsScript,
} from '../lib/appsScript';
import { OperationType, auth, db, handleFirestoreError } from '../lib/firebase';
import { getStoredAttribution } from '../lib/utm';

interface ConversationDoc {
  id: string;
  visitorUid: string;
  visitorName: string;
  visitorEmail: string;
  status: 'open' | 'closed';
  deletionRequested: boolean;
}

interface ChatMessageDoc {
  id: string;
  conversationId: string;
  visitorUid: string;
  senderUid: string;
  senderRole: 'visitor' | 'admin';
  senderName: string;
  text: string;
  createdAt?: Timestamp | null;
}

const ACTIVE_CONV_KEY = 'hisab_sutra_active_conversation_id';

const COMMON_TIMEZONES = [
  'Europe/London (GMT/BST)',
  'Europe/Berlin (CET/CEST)',
  'Asia/Dubai (GST)',
  'Asia/Riyadh (AST)',
  'Asia/Qatar (AST)',
  'Asia/Kathmandu (NPT)',
  'UTC',
];

function generateId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${rand}`;
}

function formatMessageTime(ts?: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Sending...';
  return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'meeting' | 'deleteConfirm'>('chat');
  const [user, setUser] = useState<User | null>(null);

  // Pre-chat state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [openingMessage, setOpeningMessage] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  // Active chat state
  const [conversationId, setConversationId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(ACTIVE_CONV_KEY);
    } catch {
      return null;
    }
  });
  const [conversation, setConversation] = useState<ConversationDoc | null>(null);
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [chatError, setChatError] = useState('');

  // Meeting request state
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [meetingTimezone, setMeetingTimezone] = useState(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return detected || 'Europe/London (GMT/BST)';
    } catch {
      return 'Europe/London (GMT/BST)';
    }
  });
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingSubmitting, setMeetingSubmitting] = useState(false);
  const [meetingSuccess, setMeetingSuccess] = useState(false);
  const [showCalPlaceholderNote, setShowCalPlaceholderNote] = useState(false);

  const [deletingData, setDeletingData] = useState(false);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const calComUrl = useMemo(() => {
    const raw = import.meta.env.VITE_CALCOM_URL as string | undefined;
    return raw && raw.startsWith('https://') ? raw : '';
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Restore visitor's active conversation if signed in anonymously
  useEffect(() => {
    if (!user || !conversationId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    const convRef = doc(db, 'conversations', conversationId);
    const unsubConv = onSnapshot(
      convRef,
      (snap) => {
        if (!snap.exists()) {
          setConversation(null);
          setConversationId(null);
          try {
            window.localStorage.removeItem(ACTIVE_CONV_KEY);
          } catch {
            // ignore
          }
          return;
        }
        const data = snap.data();
        if (data.visitorUid !== user.uid) {
          setConversation(null);
          return;
        }
        setConversation({
          id: snap.id,
          visitorUid: data.visitorUid,
          visitorName: data.visitorName,
          visitorEmail: data.visitorEmail,
          status: data.status,
          deletionRequested: Boolean(data.deletionRequested),
        });
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `conversations/${conversationId}`);
        } catch {
          setConversation(null);
        }
      }
    );

    const msgsQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('visitorUid', '==', user.uid)
    );
    const unsubMsgs = onSnapshot(
      msgsQuery,
      (snap) => {
        const list: ChatMessageDoc[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessageDoc, 'id'>),
          }))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
            const tb = b.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
            return ta - tb;
          });
        setMessages(list);
      },
      (error) => {
        try {
          handleFirestoreError(
            error,
            OperationType.LIST,
            `conversations/${conversationId}/messages`
          );
        } catch {
          setChatError('Unable to load chat messages. Please refresh and try again.');
        }
      }
    );

    return () => {
      unsubConv();
      unsubMsgs();
    };
  }, [user, conversationId]);

  useEffect(() => {
    if (isOpen && viewMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, viewMode]);

  // Hide visitor widget on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const ensureVisitorAuth = async (): Promise<User> => {
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
  };

  const handleStartChat = async (e: FormEvent) => {
    e.preventDefault();
    setChatError('');
    setDeletedSuccess(false);

    const name = visitorName.trim();
    const email = visitorEmail.trim().toLowerCase();
    const firstMsg = openingMessage.trim();

    if (name.length < 2 || name.length > 100) {
      setChatError('Please enter your name (2–100 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      setChatError('Please enter a valid email address.');
      return;
    }
    if (firstMsg.length < 1 || firstMsg.length > 1500) {
      setChatError('Please enter an opening message (up to 1,500 characters).');
      return;
    }

    setStartingChat(true);
    try {
      const activeUser = await ensureVisitorAuth();
      const newConvId = generateId('conv');
      const newMsgId = generateId('msg');
      const attribution = getStoredAttribution();

      await setDoc(doc(db, 'conversations', newConvId), {
        visitorUid: activeUser.uid,
        visitorName: name,
        visitorEmail: email,
        status: 'open',
        unreadByAdmin: true,
        unreadCountAdmin: 1,
        lastMessagePreview: firstMsg.slice(0, 180),
        utmSource: attribution.utmSource.slice(0, 120),
        utmMedium: attribution.utmMedium.slice(0, 120),
        utmCampaign: attribution.utmCampaign.slice(0, 120),
        referrer: attribution.referrer.slice(0, 500),
        landingPage: attribution.landingPage.slice(0, 300),
        deletionRequested: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'conversations', newConvId, 'messages', newMsgId), {
        conversationId: newConvId,
        visitorUid: activeUser.uid,
        senderUid: activeUser.uid,
        senderRole: 'visitor',
        senderName: name,
        text: firstMsg,
        createdAt: serverTimestamp(),
      });

      try {
        window.localStorage.setItem(ACTIVE_CONV_KEY, newConvId);
      } catch {
        // ignore
      }

      setConversationId(newConvId);
      setOpeningMessage('');

      // Notify admin ONCE when a new chat starts
      void notifyChatStartedViaAppsScript({
        conversationId: newConvId,
        visitorName: name,
        visitorEmail: email,
        firstMessage: firstMsg,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        landingPage: attribution.landingPage,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed') || msg.includes('admin-restricted-operation')) {
        setChatError(
          'Anonymous sign-in is not enabled yet in Firebase Authentication. Please enable Anonymous Sign-in in Firebase Console.'
        );
      } else {
        setChatError('Could not start chat right now. Please try again or use the Contact form.');
      }
    } finally {
      setStartingChat(false);
    }
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !conversation) return;
    setChatError('');

    const text = replyText.trim();
    if (text.length < 1 || text.length > 1500) {
      setChatError('Messages must be between 1 and 1,500 characters.');
      return;
    }

    setSendingReply(true);
    const msgId = generateId('msg');
    const msgPath = `conversations/${conversation.id}/messages/${msgId}`;

    try {
      await setDoc(doc(db, 'conversations', conversation.id, 'messages', msgId), {
        conversationId: conversation.id,
        visitorUid: user.uid,
        senderUid: user.uid,
        senderRole: 'visitor',
        senderName: conversation.visitorName,
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessagePreview: text.slice(0, 180),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadByAdmin: true,
        unreadCountAdmin: increment(1),
      });

      setReplyText('');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, msgPath);
      } catch {
        setChatError('Unable to send message. Please try again.');
      }
    } finally {
      setSendingReply(false);
    }
  };

  const handleMeetingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setChatError('');

    const activeName = (conversation?.visitorName || visitorName).trim();
    const activeEmail = (conversation?.visitorEmail || visitorEmail).trim().toLowerCase();

    if (activeName.length < 2) {
      setChatError('Please enter your name before requesting a meeting.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeEmail)) {
      setChatError('Please enter a valid email address.');
      return;
    }
    if (!meetingDate || !meetingTime || !meetingTimezone.trim()) {
      setChatError('Please select a preferred date, time, and timezone.');
      return;
    }

    setMeetingSubmitting(true);
    try {
      const activeUser = await ensureVisitorAuth();
      const requestId = generateId('mtg');
      const attribution = getStoredAttribution();

      await setDoc(doc(db, 'meetingRequests', requestId), {
        visitorUid: activeUser.uid,
        conversationId: conversation?.id || '',
        visitorName: activeName.slice(0, 100),
        visitorEmail: activeEmail.slice(0, 160),
        preferredDate: meetingDate.slice(0, 40),
        preferredTime: meetingTime.slice(0, 40),
        timezone: meetingTimezone.trim().slice(0, 80),
        topic: meetingTopic.trim().slice(0, 500),
        status: 'pending',
        utmSource: attribution.utmSource.slice(0, 120),
        utmMedium: attribution.utmMedium.slice(0, 120),
        utmCampaign: attribution.utmCampaign.slice(0, 120),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify admin via Apps Script (Email + Telegram + client confirmation email)
      void notifyMeetingRequestedViaAppsScript({
        requestId,
        visitorName: activeName,
        visitorEmail: activeEmail,
        preferredDate: meetingDate,
        preferredTime: meetingTime,
        timezone: meetingTimezone,
        topic: meetingTopic.trim(),
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
      });

      setMeetingSuccess(true);
      setMeetingTopic('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed') || msg.includes('admin-restricted-operation')) {
        setChatError(
          'Anonymous sign-in is not enabled yet in Firebase Authentication. Please enable Anonymous Sign-in in Firebase Console.'
        );
      } else {
        setChatError('Unable to save meeting request right now. Please try again.');
      }
    } finally {
      setMeetingSubmitting(false);
    }
  };

  const handleDeleteChatData = async () => {
    if (!user || !conversation) return;
    setDeletingData(true);
    setChatError('');

    try {
      const msgsQuery = query(
        collection(db, 'conversations', conversation.id, 'messages'),
        where('visitorUid', '==', user.uid)
      );
      const msgsSnap = await getDocs(msgsQuery);
      for (const msgDoc of msgsSnap.docs) {
        await deleteDoc(doc(db, 'conversations', conversation.id, 'messages', msgDoc.id));
      }
      await deleteDoc(doc(db, 'conversations', conversation.id));

      try {
        window.localStorage.removeItem(ACTIVE_CONV_KEY);
      } catch {
        // ignore
      }

      setConversationId(null);
      setConversation(null);
      setMessages([]);
      setViewMode('chat');
      setDeletedSuccess(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `conversations/${conversation.id}`);
      } catch {
        setChatError('Could not delete chat data automatically. Please use the Privacy page form.');
      }
    } finally {
      setDeletingData(false);
    }
  };

  return (
    <div className="fixed bottom-4 end-4 z-40 lg:z-[55]">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open live chat with Hisab Sutra"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-white text-sm font-semibold shadow-lg border border-slate-700 transition-colors min-h-[44px] whitespace-nowrap"
        >
          <MessageSquare className="h-4 w-4 text-teal-300" aria-hidden="true" />
          <span>Chat with Us</span>
        </button>
      )}

      {isOpen && (
        <section
          aria-label="Hisab Sutra Live Chat"
          className="w-[370px] max-w-[calc(100vw-2rem)] h-[min(540px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] min-h-0 card shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <header className="bg-[#0B1F3A] text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div>
              <h2 className="text-sm font-bold leading-tight">Hisab Sutra Team</h2>
              <p className="text-[11px] text-teal-300">Kathmandu Finance Desk</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setMeetingSuccess(false);
                  setChatError('');
                  setViewMode(viewMode === 'meeting' ? 'chat' : 'meeting');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded-md transition-colors whitespace-nowrap"
              >
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {viewMode === 'meeting' ? 'Back to Chat' : 'Request a meeting'}
              </button>

              {conversation && (
                <button
                  type="button"
                  title="Delete my chat data"
                  aria-label="Delete my chat data"
                  onClick={() =>
                    setViewMode(viewMode === 'deleteConfirm' ? 'chat' : 'deleteConfirm')
                  }
                  className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Mandatory Security Notice */}
          <div className="px-3.5 py-2 bg-warn-bg border-b border-warn-line text-[11px] text-warn-fg leading-snug shrink-0">
            Please do not share bank details, passwords or documents here. Send documents by email
            to <a href="mailto:hisabsutra@bikasb.com.np" className="font-semibold underline underline-offset-2">hisabsutra@bikasb.com.np</a>.
          </div>

          {/* Error Banner */}
          {chatError && (
            <div
              role="alert"
              className="mx-3 mt-2 p-2.5 rounded-lg bg-danger-bg border border-danger-line text-xs text-danger-fg flex items-start gap-2 shrink-0"
            >
              <ShieldAlert className="h-4 w-4 text-danger-fg shrink-0 mt-0.5" aria-hidden="true" />
              <span>{chatError}</span>
            </div>
          )}

          {/* VIEW: Delete Chat Confirmation */}
          {viewMode === 'deleteConfirm' && conversation && (
            <div className="flex-1 p-4 flex flex-col justify-center space-y-4">
              <h3 className="text-base font-bold text-navy-900">Delete Your Chat Data?</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                This will permanently remove your active conversation and all messages from our
                database immediately.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deletingData}
                  onClick={() => void handleDeleteChatData()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg min-h-[38px]"
                >
                  {deletingData ? 'Deleting...' : 'Yes, Delete My Chat'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chat')}
                  className="px-4 py-2 text-xs font-medium text-ink-700 border border-line-300 hover:bg-paper-50 rounded-lg min-h-[38px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* VIEW: Request a Meeting */}
          {viewMode === 'meeting' && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
              {meetingSuccess ? (
                <div className="p-4 rounded-lg bg-accent-50 border border-accent-200 space-y-3">
                  <div className="flex items-center gap-2 text-accent-900 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent-700" aria-hidden="true" />
                    <span>Meeting Request Sent</span>
                  </div>
                  <p className="text-xs text-accent-900 leading-relaxed">
                    We received your preferred slot ({meetingDate} at {meetingTime},{' '}
                    {meetingTimezone}) and sent a confirmation email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewMode('chat')}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg"
                  >
                    Return to Chat
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMeetingSubmit} className="space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">Request a Call Slot</h3>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Pick a preferred date and time—our team will send a calendar invite.
                    </p>
                  </div>

                  {!conversation && (
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="Full name"
                          className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          maxLength={160}
                          value={visitorEmail}
                          onChange={(e) => setVisitorEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Timezone *
                    </label>
                    <input
                      list="hs-timezones"
                      required
                      maxLength={80}
                      value={meetingTimezone}
                      onChange={(e) => setMeetingTimezone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                    />
                    <datalist id="hs-timezones">
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                      Topic (optional)
                    </label>
                    <input
                      type="text"
                      maxLength={500}
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      placeholder="e.g. Monthly bookkeeping for UK Ltd"
                      className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={meetingSubmitting}
                    className="w-full py-2.5 text-xs font-semibold text-white btn-primary disabled:opacity-60 rounded-lg min-h-[40px]"
                  >
                    {meetingSubmitting ? 'Sending Request...' : 'Send Meeting Request'}
                  </button>

                  {/* Optional Cal.com link button */}
                  <div className="pt-2 border-t border-line-200">
                    {calComUrl ? (
                      <a
                        href={calComUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-navy-900 bg-paper-100 hover:bg-paper-200 rounded-lg"
                      >
                        Book Directly via Cal.com
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => setShowCalPlaceholderNote((prev) => !prev)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-ink-700 bg-paper-100 hover:bg-paper-200 rounded-lg"
                        >
                          [Cal.com Link Placeholder]
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        {showCalPlaceholderNote && (
                          <p className="text-[11px] text-ink-500 leading-snug">
                            Optional: Add your Cal.com scheduling URL as{' '}
                            <span className="font-mono">VITE_CALCOM_URL</span> to activate instant
                            self-booking here.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW: Active Chat or Pre-Chat Form */}
          {viewMode === 'chat' && !conversation && (
            <form onSubmit={handleStartChat} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
              {deletedSuccess && (
                <div className="p-2.5 rounded-lg bg-accent-50 border border-accent-200 text-xs text-accent-900">
                  Your previous chat history has been permanently deleted.
                </div>
              )}

              <p className="text-xs text-ink-600 leading-relaxed">
                Enter your name and email to start a real-time chat with our Kathmandu team.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. David Patel"
                  className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  maxLength={160}
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="david@company.co.uk"
                  className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-700 mb-1">
                  How can we help? *
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={1500}
                  value={openingMessage}
                  onChange={(e) => setOpeningMessage(e.target.value)}
                  placeholder="Ask about bookkeeping, Xero/QuickBooks support, or monthly pricing..."
                  className="w-full px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                />
              </div>

              <button
                type="submit"
                disabled={startingChat}
                className="w-full py-2.5 text-xs font-semibold text-white btn-primary disabled:opacity-60 rounded-lg min-h-[40px]"
              >
                {startingChat ? 'Starting Chat...' : 'Start Live Chat'}
              </button>
            </form>
          )}

          {viewMode === 'chat' && conversation && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-2.5 bg-paper-50">
                {messages.map((msg) => {
                  const isVisitor = msg.senderRole === 'visitor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-ink-500 mb-0.5 px-1">
                        {isVisitor ? 'You' : 'Hisab Sutra'} · {formatMessageTime(msg.createdAt)}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                          isVisitor
                            ? 'bg-[#0B1F3A] text-white'
                            : 'bg-surface border border-line-200 text-ink-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {conversation.status === 'closed' ? (
                <div className="p-3 border-t border-line-200 bg-surface text-center space-y-2 shrink-0">
                  <p className="text-xs text-ink-600">This chat has been marked as resolved.</p>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        window.localStorage.removeItem(ACTIVE_CONV_KEY);
                      } catch {
                        // ignore
                      }
                      setConversationId(null);
                      setConversation(null);
                      setMessages([]);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B1F3A] rounded-lg"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSendReply}
                  className="p-2.5 border-t border-line-200 bg-surface flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    maxLength={1500}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Chat message"
                    className="flex-1 px-3 py-2 text-xs border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    aria-label="Send message"
                    className="inline-flex items-center justify-center p-2 rounded-lg btn-primary disabled:opacity-50 text-white min-h-[36px] min-w-[36px]"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
