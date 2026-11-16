import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Activity,
  Calendar,
  LogIn,
  LogOut,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import { OperationType, auth, db, googleProvider, handleFirestoreError } from '../lib/firebase';
import { SeoHead } from '../components/SeoHead';

type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';
type MeetingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface LeadRecord {
  id: string;
  name: string;
  workEmail: string;
  company: string;
  country: string;
  serviceNeeded: string;
  monthlyVolume: string;
  message: string;
  status: LeadStatus;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  landingPage: string;
  createdAt?: Timestamp | null;
}

interface EventRecord {
  id: string;
  visitorId: string;
  eventType: string;
  page: string;
  label: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  createdAt?: Timestamp | null;
}

interface ConversationRecord {
  id: string;
  visitorUid: string;
  visitorName: string;
  visitorEmail: string;
  status: 'open' | 'closed';
  unreadByAdmin: boolean;
  unreadCountAdmin: number;
  lastMessagePreview: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  landingPage: string;
  deletionRequested: boolean;
  lastMessageAt?: Timestamp | null;
}

interface ChatMessageRecord {
  id: string;
  senderRole: 'visitor' | 'admin';
  senderName: string;
  text: string;
  createdAt?: Timestamp | null;
}

interface MeetingRequestRecord {
  id: string;
  visitorName: string;
  visitorEmail: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  topic: string;
  status: MeetingStatus;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  createdAt?: Timestamp | null;
}

interface DeletionRequestRecord {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'completed';
  createdAt?: Timestamp | null;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'text-accent-800 bg-accent-50 border-accent-200',
  contacted: 'text-warn-fg bg-warn-bg border-warn-line',
  won: 'text-ok-fg bg-ok-bg border-ok-line',
  lost: 'text-ink-600 bg-paper-100 border-line-200',
};

const MEETING_STYLES: Record<MeetingStatus, string> = {
  pending: 'text-warn-fg bg-warn-bg border-warn-line',
  confirmed: 'text-accent-800 bg-accent-50 border-accent-200',
  completed: 'text-ok-fg bg-ok-bg border-ok-line',
  cancelled: 'text-ink-600 bg-paper-100 border-line-200',
};

function formatTimestamp(ts?: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  return ts.toDate().toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatCampaign(source: string, medium: string, campaign: string): string {
  return [source, medium, campaign].filter(Boolean).join(' / ') || 'Direct / Organic';
}

export function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'leads' | 'chat' | 'meetings' | 'activity'>('leads');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequestRecord[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequestRecord[]>([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Leads filter
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Chat inbox state
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<ChatMessageRecord[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      setPermissionDenied(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user || user.isAnonymous) {
      setLeads([]);
      setEvents([]);
      setConversations([]);
      setMeetings([]);
      setDeletionRequests([]);
      return;
    }

    setDataLoading(true);
    setPermissionDenied(false);

    const unsubLeads = onSnapshot(
      query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LeadRecord, 'id'>) })));
        setDataLoading(false);
      },
      (error) => {
        setDataLoading(false);
        setPermissionDenied(true);
        try {
          handleFirestoreError(error, OperationType.LIST, 'leads');
        } catch {
          // Handled via UI state
        }
      }
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventRecord, 'id'>) })));
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'events');
        } catch {
          // Handled via permissionDenied
        }
      }
    );

    const unsubConvs = onSnapshot(
      query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'), limit(100)),
      (snap) => {
        setConversations(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ConversationRecord, 'id'>) }))
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'conversations');
        } catch {
          // Handled
        }
      }
    );

    const unsubMeetings = onSnapshot(
      query(collection(db, 'meetingRequests'), orderBy('createdAt', 'desc'), limit(100)),
      (snap) => {
        setMeetings(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MeetingRequestRecord, 'id'>) }))
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'meetingRequests');
        } catch {
          // Handled
        }
      }
    );

    const unsubDeletions = onSnapshot(
      query(collection(db, 'deletionRequests'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        setDeletionRequests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DeletionRequestRecord, 'id'>) }))
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'deletionRequests');
        } catch {
          // Handled
        }
      }
    );

    return () => {
      unsubLeads();
      unsubEvents();
      unsubConvs();
      unsubMeetings();
      unsubDeletions();
    };
  }, [authReady, user]);

  // Listen to messages for the currently selected conversation in Admin Chat Inbox
  useEffect(() => {
    if (!selectedConvId || !user || user.isAnonymous) {
      setConvMessages([]);
      return;
    }

    const unsub = onSnapshot(
      query(collection(db, 'conversations', selectedConvId, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        setConvMessages(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessageRecord, 'id'>) }))
        );
      },
      (error) => {
        try {
          handleFirestoreError(
            error,
            OperationType.LIST,
            `conversations/${selectedConvId}/messages`
          );
        } catch {
          // Handled
        }
      }
    );

    return () => unsub();
  }, [selectedConvId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.id === selectedConvId) || null,
    [conversations, selectedConvId]
  );

  // Clear unread indicator when opening a conversation
  useEffect(() => {
    if (selectedConv && (selectedConv.unreadByAdmin || selectedConv.unreadCountAdmin > 0)) {
      void updateDoc(doc(db, 'conversations', selectedConv.id), {
        unreadByAdmin: false,
        unreadCountAdmin: 0,
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
  }, [selectedConv]);

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in with Google.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleStatusChange = async (leadId: string, nextStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadId}`);
      } catch {
        // Logged
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMeetingStatusChange = async (requestId: string, nextStatus: MeetingStatus) => {
    try {
      await updateDoc(doc(db, 'meetingRequests', requestId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `meetingRequests/${requestId}`);
      } catch {
        // Logged
      }
    }
  };

  const handleSendAdminReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConv || !adminReply.trim()) return;

    const text = adminReply.trim().slice(0, 1500);
    setSendingReply(true);
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    try {
      await setDoc(doc(db, 'conversations', selectedConv.id, 'messages', msgId), {
        conversationId: selectedConv.id,
        visitorUid: selectedConv.visitorUid,
        senderUid: user.uid,
        senderRole: 'admin',
        senderName: 'Hisab Sutra Team',
        text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessagePreview: text.slice(0, 180),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadByAdmin: false,
        unreadCountAdmin: 0,
      });

      setAdminReply('');
    } catch (err) {
      try {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `conversations/${selectedConv.id}/messages/${msgId}`
        );
      } catch {
        // Logged
      }
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleConvStatus = async (conv: ConversationRecord) => {
    const nextStatus = conv.status === 'open' ? 'closed' : 'open';
    try {
      await updateDoc(doc(db, 'conversations', conv.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `conversations/${conv.id}`);
      } catch {
        // Logged
      }
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      const msgsSnap = await getDocs(collection(db, 'conversations', convId, 'messages'));
      for (const m of msgsSnap.docs) {
        await deleteDoc(doc(db, 'conversations', convId, 'messages', m.id));
      }
      await deleteDoc(doc(db, 'conversations', convId));
      if (selectedConvId === convId) setSelectedConvId(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `conversations/${convId}`);
      } catch {
        // Logged
      }
    }
  };

  const handleMarkDeletionDone = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'deletionRequests', reqId), { status: 'completed' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `deletionRequests/${reqId}`);
      } catch {
        // Logged
      }
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q) ||
        lead.workEmail.toLowerCase().includes(q) ||
        lead.utmCampaign.toLowerCase().includes(q) ||
        lead.utmSource.toLowerCase().includes(q)
      );
    });
  }, [leads, statusFilter, searchQuery]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  const unreadChatsCount = useMemo(
    () => conversations.filter((c) => c.unreadByAdmin).length,
    [conversations]
  );

  const counts = useMemo(
    () => ({
      totalLeads: leads.length,
      unreadChats: unreadChatsCount,
      pendingMeetings: meetings.filter((m) => m.status === 'pending').length,
      eventsCount: events.length,
    }),
    [leads, unreadChatsCount, meetings, events]
  );

  if (!authReady) {
    return (
      <section className="py-16 bg-paper-50 min-h-[60vh]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="h-32 card animate-pulse" />
        </div>
      </section>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <>
        <SeoHead
          title="Admin Console – Hisab Sutra"
          description="Restricted administrator portal for Hisab Sutra lead management, live chat, and meeting requests."
          canonicalPath="/admin"
        />
        <section className="py-20 bg-paper-50 min-h-[70vh] flex items-center justify-center px-4">
          <div className="card p-8 max-w-md w-full space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-accent-800">Restricted Access</p>
              <h1 className="text-2xl font-bold text-navy-900">Hisab Sutra Admin Console</h1>
              <p className="text-sm text-ink-600">
                Sign in with your verified administrator Google account to manage leads, reply to
                live chats, and review meeting requests.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-danger-bg border border-danger-line text-xs text-danger-fg">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white btn-primary rounded-lg transition-colors min-h-[44px]"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in with Google
            </button>
          </div>
        </section>
      </>
    );
  }

  if (permissionDenied) {
    return (
      <>
        <SeoHead
          title="Access Denied – Hisab Sutra Admin"
          description="Administrator authorization required."
          canonicalPath="/admin"
        />
        <section className="py-20 bg-paper-50 min-h-[70vh] flex items-center justify-center px-4">
          <div className="card p-8 max-w-md w-full space-y-4">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-danger-bg text-danger-fg">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-navy-900">Admin Privileges Required</h1>
            <p className="text-sm text-ink-600 leading-relaxed">
              Signed in as <span className="font-semibold">{user.email}</span>, which does not hold
              administrator access for Hisab Sutra records.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ink-700 border border-line-300 hover:bg-paper-50 rounded-lg min-h-[40px]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Admin Console – Hisab Sutra"
        description="Hisab Sutra admin lead pipeline, live chat inbox, and visitor analytics."
        canonicalPath="/admin"
      />

      <section className="bg-surface border-b border-line-200 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-accent-800">Admin Console</p>
            <h1 className="text-2xl font-bold text-navy-900">
              Leads, Live Chat &amp; Meeting Requests
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-600 truncate max-w-[220px]">{user.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-ink-700 border border-line-300 hover:bg-paper-50 rounded-lg min-h-[38px] whitespace-nowrap shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-paper-50 min-h-[70vh]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <p className="text-xs text-ink-500">Total Leads</p>
              <p className="text-2xl font-bold text-navy-900 font-mono tabular-nums mt-1">
                {counts.totalLeads}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-ink-500">Unread Live Chats</p>
              <p className="text-2xl font-bold text-accent-700 font-mono tabular-nums mt-1">
                {counts.unreadChats}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-ink-500">Pending Meetings</p>
              <p className="text-2xl font-bold text-warn-fg font-mono tabular-nums mt-1">
                {counts.pendingMeetings}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-ink-500">Consented Events</p>
              <p className="text-2xl font-bold text-navy-900 font-mono tabular-nums mt-1">
                {counts.eventsCount}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'leads'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-surface text-ink-700 border border-line-200 hover:bg-paper-100'
              }`}
            >
              <Users className="h-4 w-4" aria-hidden="true" />
              Leads ({leads.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'chat'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-surface text-ink-700 border border-line-200 hover:bg-paper-100'
              }`}
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Live Chat ({conversations.length}
              {unreadChatsCount > 0 ? ` · ${unreadChatsCount} unread` : ''})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('meetings')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'meetings'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-surface text-ink-700 border border-line-200 hover:bg-paper-100'
              }`}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Meetings ({meetings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'activity'
                  ? 'bg-[#0B1F3A] text-white'
                  : 'bg-surface text-ink-700 border border-line-200 hover:bg-paper-100'
              }`}
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              Visitor Activity ({events.length})
            </button>
          </div>

          {/* TAB 1: LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['all', 'new', 'contacted', 'won', 'lost'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 ${
                        statusFilter === status
                          ? 'bg-[#0B1F3A] text-white'
                          : 'bg-surface border border-line-200 text-ink-700 hover:bg-paper-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search
                    className="h-4 w-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, company, campaign..."
                    className="w-full ps-9 pe-3 py-2 text-sm bg-surface border border-line-200 rounded-lg focus:outline-none focus:border-accent-700"
                  />
                </div>
              </div>

              <div className="card overflow-hidden">
                {dataLoading ? (
                  <div className="p-6 space-y-3">
                    <div className="h-10 bg-paper-100 rounded animate-pulse" />
                    <div className="h-10 bg-paper-100 rounded animate-pulse" />
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="p-10 text-center text-sm text-ink-500">
                    No lead submissions match the selected filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-line-200 bg-paper-50 text-xs font-semibold text-ink-600">
                          <th className="py-3 px-4">Contact &amp; Company</th>
                          <th className="py-3 px-4">Service &amp; Region</th>
                          <th className="py-3 px-4">Campaign Source</th>
                          <th className="py-3 px-4">Submitted</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line-200">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-paper-50/70">
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-navy-900">{lead.name}</p>
                              <p className="text-xs text-ink-600">
                                {lead.company} · {lead.workEmail}
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="text-ink-800 font-medium">{lead.serviceNeeded}</p>
                              <p className="text-xs text-ink-500">
                                {lead.country} · {lead.monthlyVolume}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-ink-600">
                              {formatCampaign(lead.utmSource, lead.utmMedium, lead.utmCampaign)}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-ink-500 font-mono tabular-nums whitespace-nowrap">
                              {formatTimestamp(lead.createdAt)}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                aria-label={`Status for ${lead.name}`}
                                value={lead.status}
                                disabled={updatingId === lead.id}
                                onChange={(e) =>
                                  void handleStatusChange(lead.id, e.target.value as LeadStatus)
                                }
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border ${
                                  STATUS_STYLES[lead.status]
                                }`}
                              >
                                <option value="new">new</option>
                                <option value="contacted">contacted</option>
                                <option value="won">won</option>
                                <option value="lost">lost</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedLeadId(selectedLeadId === lead.id ? null : lead.id)
                                }
                                className="text-xs font-semibold text-accent-800 hover:text-accent-900 underline underline-offset-4"
                              >
                                {selectedLeadId === lead.id ? 'Hide' : 'Details'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedLead && (
                <div className="card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-navy-900">
                      Lead Details — {selectedLead.company}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedLeadId(null)}
                      className="text-xs text-ink-500 hover:text-ink-800"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-sm text-ink-700 whitespace-pre-wrap">
                    {selectedLead.message || 'No message provided.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-line-100 text-xs text-ink-600">
                    <div>
                      <span className="font-semibold text-ink-800">Referrer:</span>{' '}
                      {selectedLead.referrer || 'None'}
                    </div>
                    <div>
                      <span className="font-semibold text-ink-800">Landing Page:</span>{' '}
                      {selectedLead.landingPage || '/'}
                    </div>
                    <div>
                      <span className="font-semibold text-ink-800">Lead ID:</span>{' '}
                      <span className="font-mono">{selectedLead.id}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE CHAT INBOX */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 card overflow-hidden min-h-[520px]">
                {/* Conversations List */}
                <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-e border-line-200 divide-y divide-line-200 overflow-y-auto max-h-[560px]">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-sm text-ink-500">
                      No live chat conversations yet.
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const active = selectedConvId === conv.id;
                      return (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => setSelectedConvId(conv.id)}
                          className={`w-full text-start p-4 transition-colors space-y-1.5 ${
                            active ? 'bg-paper-100' : 'hover:bg-paper-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-navy-900 truncate">
                              {conv.visitorName}
                            </span>
                            {conv.unreadByAdmin ? (
                              <span className="text-[11px] font-bold text-accent-800 font-mono tabular-nums shrink-0">
                                {conv.unreadCountAdmin > 0 ? `${conv.unreadCountAdmin} unread` : 'Unread'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                                {conv.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-ink-600 truncate">{conv.visitorEmail}</p>
                          <p className="text-xs text-ink-700 line-clamp-1">
                            {conv.lastMessagePreview}
                          </p>
                          <p className="text-[11px] text-ink-500">
                            Source: {formatCampaign(conv.utmSource, conv.utmMedium, conv.utmCampaign)}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Conversation Thread */}
                <div className="lg:col-span-7 flex flex-col h-[560px]">
                  {!selectedConv ? (
                    <div className="flex-1 flex items-center justify-center p-8 text-sm text-ink-500">
                      Select a conversation on the left to view messages and reply in real time.
                    </div>
                  ) : (
                    <>
                      <div className="px-5 py-3.5 border-b border-line-200 flex flex-wrap items-center justify-between gap-3 bg-paper-50">
                        <div>
                          <p className="text-sm font-bold text-navy-900">
                            {selectedConv.visitorName} ·{' '}
                            <span className="font-normal text-ink-600">
                              {selectedConv.visitorEmail}
                            </span>
                          </p>
                          <p className="text-xs text-ink-500">
                            Campaign:{' '}
                            {formatCampaign(
                              selectedConv.utmSource,
                              selectedConv.utmMedium,
                              selectedConv.utmCampaign
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleConvStatus(selectedConv)}
                            className="px-3 py-1.5 text-xs font-semibold border border-line-300 bg-surface hover:bg-paper-50 text-ink-700 rounded-lg"
                          >
                            {selectedConv.status === 'open' ? 'Mark Resolved' : 'Reopen Chat'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteConversation(selectedConv.id)}
                            title="Delete conversation"
                            aria-label="Delete conversation"
                            className="p-1.5 text-danger-fg hover:bg-danger-bg rounded-lg border border-danger-line"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-paper-50/50">
                        {convMessages.map((msg) => {
                          const isAdminMsg = msg.senderRole === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[11px] text-ink-500 mb-0.5">
                                {msg.senderName} · {formatTimestamp(msg.createdAt)}
                              </span>
                              <div
                                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                                  isAdminMsg
                                    ? 'bg-[#0B1F3A] text-white'
                                    : 'bg-surface border border-line-200 text-ink-800'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>

                      <form
                        onSubmit={handleSendAdminReply}
                        className="p-3.5 border-t border-line-200 bg-surface flex items-center gap-2"
                      >
                        <input
                          type="text"
                          maxLength={1500}
                          value={adminReply}
                          onChange={(e) => setAdminReply(e.target.value)}
                          placeholder="Reply to visitor in real time..."
                          className="flex-1 px-3.5 py-2 text-sm border border-line-300 rounded-lg focus:outline-none focus:border-accent-700"
                        />
                        <button
                          type="submit"
                          disabled={sendingReply || !adminReply.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white btn-primary disabled:opacity-50 rounded-lg min-h-[40px]"
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          Reply
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {/* Deletion Requests */}
              {deletionRequests.length > 0 && (
                <div className="card p-5 space-y-3">
                  <h2 className="text-sm font-bold text-navy-900">
                    Chat Data Deletion Requests ({deletionRequests.length})
                  </h2>
                  <div className="divide-y divide-line-200 text-xs">
                    {deletionRequests.map((req) => (
                      <div
                        key={req.id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-navy-900">{req.email}</span>
                          {req.reason && <span className="text-ink-600 ms-2">· {req.reason}</span>}
                          <span className="text-slate-400 ms-2 font-mono">
                            ({formatTimestamp(req.createdAt)})
                          </span>
                        </div>
                        {req.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => void handleMarkDeletionDone(req.id)}
                            className="px-3 py-1 font-semibold text-accent-800 bg-accent-50 border border-accent-200 rounded-md self-start sm:self-auto"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-ok-fg font-semibold">completed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEETING REQUESTS */}
          {activeTab === 'meetings' && (
            <div className="card overflow-hidden">
              {meetings.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-500">
                  No meeting requests submitted from live chat yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line-200 bg-paper-50 text-xs font-semibold text-ink-600">
                        <th className="py-3 px-4">Visitor</th>
                        <th className="py-3 px-4">Requested Slot</th>
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Campaign Source</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-200">
                      {meetings.map((m) => (
                        <tr key={m.id} className="hover:bg-paper-50/70">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-navy-900">{m.visitorName}</p>
                            <p className="text-xs text-ink-600">{m.visitorEmail}</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-ink-800 tabular-nums">
                            {m.preferredDate} · {m.preferredTime}
                            <p className="font-sans text-ink-500 mt-0.5">{m.timezone}</p>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-700 max-w-xs">
                            {m.topic || 'Discovery call'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-600">
                            {formatCampaign(m.utmSource, m.utmMedium, m.utmCampaign)}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              aria-label={`Meeting status for ${m.visitorName}`}
                              value={m.status}
                              onChange={(e) =>
                                void handleMeetingStatusChange(m.id, e.target.value as MeetingStatus)
                              }
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border ${
                                MEETING_STYLES[m.status]
                              }`}
                            >
                              <option value="pending">pending</option>
                              <option value="confirmed">confirmed</option>
                              <option value="completed">completed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VISITOR ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="card overflow-hidden">
              {events.length === 0 ? (
                <div className="p-10 text-center text-sm text-ink-500">
                  No consented visitor events recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-line-200 bg-paper-50 text-xs font-semibold text-ink-600">
                        <th className="py-3 px-4">Event Type</th>
                        <th className="py-3 px-4">Page &amp; Label</th>
                        <th className="py-3 px-4">UTM Attribution</th>
                        <th className="py-3 px-4">Visitor ID</th>
                        <th className="py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-200">
                      {events.map((evt) => (
                        <tr key={evt.id} className="hover:bg-paper-50/70">
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-navy-900">
                            {evt.eventType}
                          </td>
                          <td className="py-3 px-4 text-xs text-ink-700">
                            <span className="font-medium">{evt.page}</span>
                            {evt.label && (
                              <span className="text-ink-500 ms-1.5">· {evt.label}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-ink-600">
                            {formatCampaign(evt.utmSource, evt.utmMedium, evt.utmCampaign)}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-ink-500">
                            {evt.visitorId.slice(0, 14)}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-ink-500 tabular-nums whitespace-nowrap">
                            {formatTimestamp(evt.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
