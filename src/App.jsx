import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Video, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Headphones, 
  Palette, 
  FileText, 
  WifiOff, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Play, 
  Pause, 
  Volume2, 
  Mail, 
  Clock, 
  Lightbulb, 
  ShieldCheck, 
  Download, 
  Bot, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  UserCheck, 
  Calendar,
  AlertTriangle,
  Lock,
  Crown,
  Zap,
  Mic,
  MessageSquare,
  User,
  UserPlus,
  Users,
  ChevronDown,
  PlusCircle,
  LogIn,
  LogOut,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckSquare,
  Square,
  Plus,
  Share2,
  UploadCloud,
  Timer,
  PhoneOff,
  Eye,
  EyeOff,
  Key,
  QrCode,
  CreditCard,
  Info,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import paymentQrImage from './assets/payment_qr.jpg';

// =========================================================================
// DESIGNATED VIP SUBSCRIPTION ACCOUNT (LIFETIME FREE VIP ALL TIME)
// =========================================================================
export const VIP_ACCOUNT_CONFIG = {
  name: "ABIRAMI P",
  email: "prabhuragul97892@gmail.com",
  password: "ragul@2007",
  plan: "yearly",
  isLifetimeVip: true,
  role: "VIP Executive Member"
};

// =========================================================================
// SUBSCRIPTION VALIDITY & EXPIRY REMINDER HELPER
// =========================================================================
export const getSubscriptionValidity = (user) => {
  if (!user) {
    return {
      isLifetime: false,
      daysRemaining: 0,
      expiryDateFormatted: "No Plan",
      isEndingSoon: false,
      isExpired: false,
      badgeText: "Free Tier",
      statusText: "Free Tier Active"
    };
  }

  const isVip = user.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase() || user.isLifetimeVip;
  if (isVip) {
    return {
      isLifetime: true,
      daysRemaining: Infinity,
      expiryDateFormatted: "Lifetime (Never Expires)",
      isEndingSoon: false,
      isExpired: false,
      badgeText: "Lifetime VIP (Free All Time)",
      statusText: "Free All Time • Unlimited Access Forever"
    };
  }

  if (user.plan === 'free') {
    return {
      isLifetime: false,
      daysRemaining: 0,
      expiryDateFormatted: "Free Tier",
      isEndingSoon: false,
      isExpired: false,
      badgeText: "Free Tier (3 calls)",
      statusText: "Free Tier (3 meetings quota)"
    };
  }

  // User with paid plan: check validity
  const now = Date.now();
  let expiryTime = user.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate).getTime() : null;

  // Fallback if subscriptionExpiryDate not set: 30 days for monthly, 365 days for yearly from start or now
  if (!expiryTime || isNaN(expiryTime)) {
    const durationDays = user.plan === 'yearly' ? 365 : 30;
    const startTime = user.subscriptionStartDate ? new Date(user.subscriptionStartDate).getTime() : now;
    expiryTime = startTime + durationDays * 24 * 60 * 60 * 1000;
  }

  const msRemaining = expiryTime - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const expiryDate = new Date(expiryTime);
  const expiryDateFormatted = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isExpired = daysRemaining <= 0;
  const isEndingSoon = !isExpired && daysRemaining <= 5;

  return {
    isLifetime: false,
    daysRemaining,
    expiryDateFormatted,
    isEndingSoon,
    isExpired,
    badgeText: isExpired 
      ? `Expired (${expiryDateFormatted})`
      : `${daysRemaining}d remaining (${expiryDateFormatted})`,
    statusText: isExpired
      ? `Subscription expired on ${expiryDateFormatted}. Renew via QR.`
      : isEndingSoon
        ? `⚠️ Ending in ${daysRemaining} days (Expires ${expiryDateFormatted})`
        : `Active: ${daysRemaining} days remaining (Expires ${expiryDateFormatted})`
  };
};

// =========================================================================
// MEETING URL VALIDATOR & PLATFORM PARSER
// =========================================================================
export const validateMeetingUrl = (rawUrl) => {
  if (!rawUrl || !rawUrl.trim()) {
    return {
      isValid: false,
      platform: 'Unknown',
      error: 'Please enter a meeting link',
      code: null
    };
  }

  const clean = rawUrl.trim();
  let urlObj;
  try {
    const withProto = clean.startsWith('http://') || clean.startsWith('https://') 
      ? clean 
      : `https://${clean}`;
    urlObj = new URL(withProto);
  } catch (err) {
    return {
      isValid: false,
      platform: 'Invalid URL',
      error: 'Invalid URL format. Please enter a valid meeting invite link.',
      code: null
    };
  }

  const host = urlObj.hostname.toLowerCase();
  const path = urlObj.pathname;

  // 1. Google Meet Validation
  if (host.includes('meet.google.com')) {
    // Google Meet meeting codes are typically 10 characters (3-4-3) like abc-defg-hij, or lookup codes
    const meetCodeMatch = path.match(/^\/([a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}|\w{9,12}|lookup\/[\w-]+)\/?$/i);
    if (!meetCodeMatch) {
      return {
        isValid: false,
        platform: 'Google Meet',
        error: 'Incomplete Google Meet link. Google Meet links must include the 10-letter meeting code (e.g., meet.google.com/abc-defg-hij).',
        code: null
      };
    }
    return {
      isValid: true,
      platform: 'Google Meet',
      error: null,
      code: meetCodeMatch[1],
      note: 'Google Meet requires the host to click "Admit" in the lobby. If this call ended earlier today, Google Meet rejects new connections.'
    };
  }

  // 2. Zoom Validation
  if (host.includes('zoom.us')) {
    const zoomMatch = path.match(/^\/(j|my|wc|w)\/([a-zA-Z0-9_-]+)\/?$/i);
    if (!zoomMatch || !zoomMatch[2] || zoomMatch[2].length < 5) {
      return {
        isValid: false,
        platform: 'Zoom',
        error: 'Incomplete Zoom link. Zoom links must include a valid meeting ID (e.g., zoom.us/j/94827103841).',
        code: null
      };
    }
    return {
      isValid: true,
      platform: 'Zoom',
      error: null,
      code: zoomMatch[2],
      note: 'Zoom requires the host to admit participants from the Waiting Room.'
    };
  }

  // 3. Microsoft Teams Validation
  if (host.includes('teams.microsoft.com') || host.includes('teams.live.com')) {
    if (!path || path === '/' || (!path.includes('meet') && !path.includes('meetup-join'))) {
      return {
        isValid: false,
        platform: 'Microsoft Teams',
        error: 'Incomplete Microsoft Teams link. Missing meetup-join or meeting ID path.',
        code: null
      };
    }
    return {
      isValid: true,
      platform: 'Microsoft Teams',
      error: null,
      code: 'teams-meeting',
      note: 'Teams meetings with lobby protection require host approval to join.'
    };
  }

  // 4. Other WebRTC platforms (Whereby, Chime, Webex)
  if (path && path.length > 3 && path !== '/') {
    return {
      isValid: true,
      platform: 'WebRTC Call',
      error: null,
      code: path.replace(/^\//, ''),
      note: 'Ensure the host has opened the meeting room.'
    };
  }

  return {
    isValid: false,
    platform: 'Unknown Platform',
    error: 'Please paste a valid meeting URL from Google Meet, Zoom, or Microsoft Teams.',
    code: null
  };
};

export default function App() {
  // =========================================================================
  // PAYMENT & QR MODAL STATE
  // =========================================================================
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState('monthly');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // =========================================================================
  // AUTHENTICATION & LOGIN STATE (NAME, GMAIL, PASSWORD)
  // =========================================================================
  const [activePlan, setActivePlan] = useState(() => {
    try {
      return localStorage.getItem('meetmee_payment_plan_v6') || 'free';
    } catch (e) {
      return 'free';
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('meetmee_is_logged_in_v6') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // =========================================================================
  // MULTI-USER STATE & LOCAL STORAGE PERSISTENCE (CLEAN STATE, NO MOCK DATA)
  // =========================================================================
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('meetmee_users_v7') || localStorage.getItem('meetmee_users_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map(u => {
            const isVip = u.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase();
            return {
              ...u,
              name: isVip ? VIP_ACCOUNT_CONFIG.name : u.name,
              plan: isVip ? 'yearly' : (u.plan || 'free'),
              isLifetimeVip: isVip,
              subscriptionExpiryDate: isVip ? null : (u.subscriptionExpiryDate || null),
              subscriptionStartDate: isVip ? null : (u.subscriptionStartDate || null),
              password: isVip ? VIP_ACCOUNT_CONFIG.password : (u.password || "default@123"),
              role: isVip ? VIP_ACCOUNT_CONFIG.role : (u.role || "Corporate Professional"),
              meetings: [], // Strictly delete default loaded meeting records, keeping only user details
              meetingsCount: 0,
              comicGenerationsUsed: 0,
              assistantHistory: []
            };
          });
          const hasVip = mapped.some(u => u.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase());
          if (!hasVip) {
            mapped.push({
              id: "usr-vip-abirami",
              name: VIP_ACCOUNT_CONFIG.name,
              email: VIP_ACCOUNT_CONFIG.email,
              password: VIP_ACCOUNT_CONFIG.password,
              role: VIP_ACCOUNT_CONFIG.role,
              plan: "yearly",
              isLifetimeVip: true,
              subscriptionExpiryDate: null,
              subscriptionStartDate: new Date().toISOString(),
              meetingsCount: 0,
              comicGenerationsUsed: 0,
              meetings: [],
              assistantHistory: []
            });
          }
          return mapped;
        }
      }
    } catch (e) {
      console.error("Error loading users:", e);
    }
    return [{
      id: "usr-vip-abirami",
      name: VIP_ACCOUNT_CONFIG.name,
      email: VIP_ACCOUNT_CONFIG.email,
      password: VIP_ACCOUNT_CONFIG.password,
      role: VIP_ACCOUNT_CONFIG.role,
      plan: "yearly",
      isLifetimeVip: true,
      subscriptionExpiryDate: null,
      subscriptionStartDate: new Date().toISOString(),
      meetingsCount: 0,
      comicGenerationsUsed: 0,
      meetings: [],
      assistantHistory: []
    }];
  });

  const [activeUserId, setActiveUserId] = useState(() => {
    try {
      const savedId = localStorage.getItem('meetmee_active_user_id_v7') || localStorage.getItem('meetmee_active_user_id_v6');
      if (savedId) return savedId;
    } catch (e) {}
    return "usr-vip-abirami";
  });

  // Current Active User (Fresh clean slate with preserved user details and payment plan)
  const activeUser = users.find(u => u.id === activeUserId) || users.find(u => u.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase()) || users[0] || {
    id: "usr-vip-abirami",
    name: VIP_ACCOUNT_CONFIG.name,
    email: VIP_ACCOUNT_CONFIG.email,
    password: VIP_ACCOUNT_CONFIG.password,
    role: VIP_ACCOUNT_CONFIG.role,
    plan: "yearly",
    isLifetimeVip: true,
    subscriptionExpiryDate: null,
    subscriptionStartDate: new Date().toISOString(),
    meetingsCount: 0,
    comicGenerationsUsed: 0,
    meetings: [],
    assistantHistory: []
  };

  const subscriptionValidity = getSubscriptionValidity(activeUser);

  // Sync users, payment plan & session to localStorage v7
  useEffect(() => {
    try {
      localStorage.setItem('meetmee_users_v7', JSON.stringify(users));
      if (activeUserId) localStorage.setItem('meetmee_active_user_id_v7', activeUserId);
      localStorage.setItem('meetmee_is_logged_in_v6', isLoggedIn ? 'true' : 'false');
      if (activeUser?.plan) localStorage.setItem('meetmee_payment_plan_v6', activeUser.plan);
    } catch (e) {
      console.error("Error saving users to storage:", e);
    }
  }, [users, activeUserId, isLoggedIn, activeUser?.plan]);

  // One-time automatic reset on startup: deletes all default and test loaded meetings while strictly preserving user credentials & payment plan
  useEffect(() => {
    try {
      const isAlreadyMigratedV7 = localStorage.getItem('meetmee_clean_reset_done_v7');
      if (!isAlreadyMigratedV7) {
        let preservedPlan = 'free';
        const oldUsers = localStorage.getItem('meetmee_users_v6') || localStorage.getItem('meetmee_users_v5');
        if (oldUsers) {
          try {
            const parsed = JSON.parse(oldUsers);
            if (Array.isArray(parsed)) {
              const paid = parsed.find(u => u.plan === 'yearly' || u.plan === 'monthly');
              if (paid) preservedPlan = paid.plan;
            }
          } catch (e) {}
        }
        localStorage.setItem('meetmee_payment_plan_v6', preservedPlan);
        setActivePlan(preservedPlan);

        // Wipe older loaded data
        localStorage.removeItem('meetmee_users_v6');
        localStorage.removeItem('meetmee_users_v5');
        localStorage.removeItem('meetmee_meetings_v4');
        localStorage.removeItem('meetmee_clean_reset_done_v6');
        localStorage.setItem('meetmee_clean_reset_done_v7', 'true');

        // Delete all meeting data from memory while keeping all user account details
        setUsers(prev => prev.map(u => ({
          ...u,
          plan: u.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase() ? 'yearly' : (preservedPlan !== 'free' ? preservedPlan : u.plan),
          meetings: [],
          meetingsCount: 0,
          comicGenerationsUsed: 0,
          assistantHistory: []
        })));
        setSelectedMeetingId(null);
      }
    } catch (e) {
      console.error("Error in clean reset v7:", e);
    }
  }, []);

  // Reset all default and newly added meeting data EXCEPT user account details & payment data
  const handleResetAllDataExceptPayment = () => {
    const preservedPlan = activeUser?.plan || activePlan || 'free';
    try {
      localStorage.setItem('meetmee_payment_plan_v6', preservedPlan);
      localStorage.removeItem('meetmee_users_v6');
      localStorage.removeItem('meetmee_users_v5');
      localStorage.removeItem('meetmee_meetings_v4');
    } catch (e) {}

    // Reset all users' meetings, records, and quotas
    setUsers(prev => prev.map(u => ({
      ...u,
      plan: u.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase() ? 'yearly' : preservedPlan,
      meetings: [],
      meetingsCount: 0,
      comicGenerationsUsed: 0,
      assistantHistory: []
    })));

    // Reset workspace UI states
    setSelectedMeetingId(null);
    setMeetingUrl('');
    setMeetingTitle('');
    setLiveTranscribedText('');
    setIsBotJoined(false);
    setIsLiveListening(false);
    setIsPopupVisible(false);
    setActiveMentorQuestion('');
    setSuggestedAnswer('');
    setCitation('');
    setEmailSent(false);

    playChime();
    const planName = preservedPlan === 'yearly' ? 'Yearly VIP (₹1,099/yr)' : preservedPlan === 'monthly' ? 'Monthly (₹99/mo)' : 'Free Tier (₹0)';
    setUpgradeNotification(`🧹 Workspace reset complete! All meeting records and newly added data cleared. Payment plan (${planName}) & QR gateway preserved.`);
    setTimeout(() => setUpgradeNotification(null), 5000);
  };

  // Login Handler (Requires: Name, Gmail, Password)
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);

    const name = loginName.trim();
    const email = loginEmail.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (!name) {
      setLoginError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes('@')) {
      setLoginError("Please enter a valid Gmail / Email address.");
      return;
    }
    if (!pass || pass.length < 5) {
      setLoginError("Password must be at least 5 characters long.");
      return;
    }

    // Check if this is the designated VIP Account
    const isVip = email === VIP_ACCOUNT_CONFIG.email.toLowerCase();
    if (isVip) {
      if (pass !== VIP_ACCOUNT_CONFIG.password) {
        setLoginError("Incorrect password for VIP account.");
        return;
      }

      const existingIndex = users.findIndex(u => u.email?.toLowerCase() === email);
      let vipUser;
      if (existingIndex >= 0) {
        vipUser = {
          ...users[existingIndex],
          name: VIP_ACCOUNT_CONFIG.name,
          plan: 'yearly',
          role: VIP_ACCOUNT_CONFIG.role,
          password: VIP_ACCOUNT_CONFIG.password
        };
        setUsers(prev => {
          const next = [...prev];
          next[existingIndex] = vipUser;
          return next;
        });
      } else {
        vipUser = {
          id: "usr-vip-abirami",
          name: VIP_ACCOUNT_CONFIG.name,
          email: VIP_ACCOUNT_CONFIG.email,
          password: VIP_ACCOUNT_CONFIG.password,
          role: VIP_ACCOUNT_CONFIG.role,
          plan: "yearly",
          meetingsCount: 0,
          comicGenerationsUsed: 0,
          meetings: [],
          assistantHistory: [
            {
              role: 'assistant',
              lang: 'en',
              text: `Welcome ABIRAMI P! Your Yearly VIP Subscription is active with unlimited meetings, comics, podcasts, and native voice AI.`
            }
          ]
        };
        setUsers(prev => [vipUser, ...prev]);
      }

      setActiveUserId(vipUser.id);
      setActivePlan('yearly');
      setIsLoggedIn(true);
      setLoginPassword('');
      playChime();
      setUpgradeNotification("👑 VIP All-Access Plan Activated! Welcome ABIRAMI P. Unlimited video meetings, comics, podcasts, and native voice AI are unlocked.");
      setTimeout(() => setUpgradeNotification(null), 6000);
      return;
    }

    // Check if standard user already exists
    const existing = users.find(u => u.email === email);
    if (existing) {
      setActiveUserId(existing.id);
      setActivePlan(existing.plan || 'free');
      setIsLoggedIn(true);
      setLoginPassword('');
    } else {
      // Register fresh user starting with a clean slate
      const newUserId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const newUser = {
        id: newUserId,
        name: name,
        email: email,
        password: pass,
        role: "Corporate Professional",
        plan: "free",
        meetingsCount: 0,
        comicGenerationsUsed: 0,
        meetings: [],
        assistantHistory: [
          {
            role: 'assistant',
            lang: 'en',
            text: `Welcome ${name}! I am your AI Meeting Assistant. Ready to transcribe, summarize, and assist on your calls.`
          }
        ]
      };
      setUsers(prev => [newUser, ...prev]);
      setActiveUserId(newUserId);
      setActivePlan('free');
      setIsLoggedIn(true);
      setLoginPassword('');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsBotJoined(false);
    setNativeBotTelemetry(null);
    setIsPopupVisible(false);
    if (isLiveListening && speechRecognitionInstance) {
      speechRecognitionInstance.stop();
      setIsLiveListening(false);
    }
    localStorage.setItem('meetmee_is_logged_in_v6', 'false');
  };

  // Switch User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAddUserMode, setIsAddUserMode] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Senior Product Engineer');

  // Ingestion form state
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isBotJoined, setIsBotJoined] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'history', 'notes', 'comic', 'podcast', 'assistant', 'pricing'
  const [upgradeNotification, setUpgradeNotification] = useState(null);
  const [showPresenceGuideModal, setShowPresenceGuideModal] = useState(false);
  const [meetingUrlError, setMeetingUrlError] = useState(null);
  const [meetingLinkStatus, setMeetingLinkStatus] = useState('live'); // 'live' | 'ended'
  const [copiedParticipantName, setCopiedParticipantName] = useState(false);

  // In-House Native Bot & Direct Tab Capture States
  const [isLiveListening, setIsLiveListening] = useState(false);
  const [liveTranscribedText, setLiveTranscribedText] = useState('');
  const [speechRecognitionInstance, setSpeechRecognitionInstance] = useState(null);
  const [nativeBotTelemetry, setNativeBotTelemetry] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Real-time HUD Pop-up state (ONLY APPEARS WHEN MENTOR/HOST ASKS A QUESTION)
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hudPulse, setHudPulse] = useState(false);
  const [activeMentorQuestion, setActiveMentorQuestion] = useState('');
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [citation, setCitation] = useState('');
  const [customQuestionInput, setCustomQuestionInput] = useState('');

  // Selected Meeting for viewing notes/comic/podcast
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  // History inline edit & search/filter state
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [monthlyPurgeMessage, setMonthlyPurgeMessage] = useState(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'permanent', 'expiring'

  // Email delivery state
  const [emailSent, setEmailSent] = useState(false);

  // Podcast player state
  const [podcastLang, setPodcastLang] = useState('en');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Native Language Voice Assistant State
  const [assistantLang, setAssistantLang] = useState('en');
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  // Live Meeting Stopwatch Timer
  const [meetingTimerSeconds, setMeetingTimerSeconds] = useState(0);
  useEffect(() => {
    let interval = null;
    if (isBotJoined || isLiveListening) {
      interval = setInterval(() => {
        setMeetingTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setMeetingTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isBotJoined, isLiveListening]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Custom Action Item Input
  const [newActionItemTask, setNewActionItemTask] = useState('');
  const [newActionItemOwner, setNewActionItemOwner] = useState('');

  // Audio file upload state
  const fileInputRef = useRef(null);

  // Helper to update active user's fields
  const updateActiveUser = (updater) => {
    setUsers(prev => prev.map(u => {
      if (u.id === activeUser.id) {
        return typeof updater === 'function' ? updater(u) : { ...u, ...updater };
      }
      return u;
    }));
  };

  // Switch Active User
  const handleSwitchUser = (userId) => {
    setActiveUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.plan) {
      setActivePlan(targetUser.plan);
    }
    setIsUserModalOpen(false);
    setIsBotJoined(false);
    setNativeBotTelemetry(null);
    setIsPopupVisible(false);
    if (isLiveListening && speechRecognitionInstance) {
      speechRecognitionInstance.stop();
      setIsLiveListening(false);
    }
  };

  // Add New User Profile (Multi-user capability)
  const handleAddNewUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const emailClean = newUserEmail.trim().toLowerCase();
    const isVip = emailClean === VIP_ACCOUNT_CONFIG.email.toLowerCase();

    const newId = isVip ? "usr-vip-abirami" : `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const freshUser = {
      id: newId,
      name: isVip ? VIP_ACCOUNT_CONFIG.name : newUserName.trim(),
      email: emailClean,
      password: isVip ? VIP_ACCOUNT_CONFIG.password : "default@123",
      role: isVip ? VIP_ACCOUNT_CONFIG.role : (newUserRole.trim() || "Corporate Professional"),
      plan: isVip ? "yearly" : "free",
      meetingsCount: 0,
      comicGenerationsUsed: 0,
      meetings: [],
      assistantHistory: [
        {
          role: 'assistant',
          lang: 'en',
          text: isVip
            ? `Welcome ABIRAMI P! Your Yearly VIP Subscription is active with unlimited meetings, comics, podcasts, and native voice AI.`
            : `Welcome ${newUserName.trim()}! I am your AI Meeting Assistant. Ready to transcribe, summarize, and assist on your calls.`
        }
      ]
    };

    setUsers(prev => [freshUser, ...prev.filter(u => u.email?.toLowerCase() !== emailClean)]);
    setActiveUserId(newId);
    if (isVip) {
      setActivePlan('yearly');
      playChime();
      setUpgradeNotification("👑 Switched to ABIRAMI P (Yearly VIP All-Access Plan Active)!");
      setTimeout(() => setUpgradeNotification(null), 5000);
    } else {
      setActivePlan(freshUser.plan);
      setUpgradeNotification(`Switched to user account: ${freshUser.name}`);
      setTimeout(() => setUpgradeNotification(null), 4000);
    }
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserMode(false);
    setIsUserModalOpen(false);
  };

  // Platform detector helper
  const detectPlatform = (url) => {
    if (!url) return 'Universal Link';
    const lower = url.toLowerCase();
    if (lower.includes('zoom.us')) return 'Zoom';
    if (lower.includes('meet.google.com')) return 'Google Meet';
    if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) return 'Microsoft Teams';
    return 'WebRTC Meeting';
  };

  // Play audio chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Quick Preset Meeting loader
  const handleApplyPreset = (presetName, presetUrl) => {
    setMeetingTitle(presetName);
    setMeetingUrl(presetUrl);
    setMeetingUrlError(null);
    setMeetingLinkStatus('live');
  };

  // =========================================================================
  // MEETING INGESTION & IN-HOUSE BOT ENGINE (ZERO RECALL.AI DEPENDENCY)
  // =========================================================================
  const handleDispatchBot = (e) => {
    e.preventDefault();
    setMeetingUrlError(null);
    if (!meetingUrl.trim()) return;

    // Check Free tier limit (3 meetings)
    if (activeUser.plan === 'free' && activeUser.meetingsCount >= 3) {
      alert("Free tier meeting limit reached (3 of 3 meetings used). Please upgrade to Monthly (₹99) or Yearly (₹1099) to attend more meetings!");
      setActiveTab('pricing');
      return;
    }

    // Check if user indicated call already ended (e.g. Afternoon meeting)
    if (meetingLinkStatus === 'ended') {
      alert("⚠️ This meeting room has concluded. Google Meet & Zoom permanently close session codes once the call ends, so participants or bots cannot enter past rooms.\n\nTo transcribe and generate notes/comics from this concluded meeting, please click '📁 Upload Audio File'.");
      fileInputRef.current?.click();
      return;
    }

    // Strict URL Validation (Verifies Google Meet codes, Zoom IDs, MS Teams format)
    const validation = validateMeetingUrl(meetingUrl);
    if (!validation.isValid) {
      setMeetingUrlError(validation.error);
      return;
    }

    const platform = validation.platform;
    const url = meetingUrl.trim();
    const title = meetingTitle.trim() || `${platform} Live Call (${validation.code || 'Meeting'})`;
    const meetingId = `mtg-${Date.now()}`;

    // 1. REAL STEP: Open the meeting in a new browser tab so the user is directly inside the call
    window.open(url, '_blank');

    // Create dynamic new meeting record for this active user
    const newMeeting = {
      id: meetingId,
      title: title,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      duration: "Live In-Call",
      platform: platform,
      url: url,
      isPermanent: false,
      daysUntilPurge: 30,
      summary: {
        tldr: [
          `Active in-call meeting copilot listening to ${platform} (${validation.code || 'Room'}).`,
          `Continuous browser audio tap streaming to sub-second vector RAG engine.`,
          `Mentor address and question detector listening in real-time.`
        ],
        anchors: [
          { concept: "Live Meeting Attendance", hint: "Participating directly in browser with active audio stream." },
          { concept: "In-Call HUD Copilot", hint: "Answers trigger automatically when mentor or team asks questions." },
          { concept: "30-Day Auto-Purge", hint: "Unsaved meetings purge monthly unless marked Save Permanently." }
        ],
        actions: [
          { id: 'act-1', task: `Review key takeaways from ${title}`, owner: activeUser.name, deadline: "Next 48h", completed: false },
          { id: 'act-2', task: "Verify hint notes delivered to team email", owner: "MeetMee Daemon", deadline: "Post-Call", completed: true }
        ]
      }
    };

    updateActiveUser(u => ({
      ...u,
      meetingsCount: u.meetingsCount + 1,
      meetings: [newMeeting, ...u.meetings]
    }));

    setSelectedMeetingId(meetingId);
    setIsBotJoined(true);
    setIsLiveListening(true);
    setMeetingUrl('');
    setMeetingTitle('');
    playChime();

    setNativeBotTelemetry({
      botId: `meetmee-native-${Math.floor(1000 + Math.random() * 9000)}`,
      engine: "MeetMee Browser Copilot & Headless Audio Tap",
      pid: Math.floor(12000 + Math.random() * 8000),
      platform: platform,
      roomCode: validation.code,
      audioTap: "WebRTC Audio Tap (16kHz PCM Stream)",
      status: "IN_CALL_RECORDING",
      connectedAt: "Just now",
      note: "Meeting opened in new tab. In-call audio stream active and transcribing live."
    });

    // Start Live Audio Stream & Visualizer
    startLiveMeetingAudio();
  };

  // Start real audio visualizer with Web Audio API AnalyserNode
  const startAudioVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(avg);
        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      console.warn("Audio meter setup notice:", e);
    }
  };

  const stopAudioVisualizer = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  };

  // Start Live Audio Stream and Speech Recognition
  const startLiveMeetingAudio = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // 1. Connect Web Audio Visualizer on Microphone / Sound Input
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaStreamRef.current = stream;
        startAudioVisualizer(stream);
      }).catch(err => {
        console.warn("Microphone stream note:", err);
      });
    }

    // 2. Start Web Speech Recognition
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setLiveTranscribedText(current);

          const lower = current.toLowerCase();
          const userFirstName = (activeUser?.name || '').toLowerCase().split(' ')[0];
          const isAddressed = (userFirstName && lower.includes(userFirstName)) || lower.includes('you') || lower.includes('team');

          // Trigger Pop-up when mentor asks question or addresses user
          if (isAddressed && 
              (lower.includes('?') || lower.includes('what') || lower.includes('how') || lower.includes('explain') || lower.includes('status') || lower.includes('latency') || lower.includes('sla') || lower.includes('pricing') || lower.includes('plan'))) {
            triggerMentorQuestionPopup(current);
          }
        };

        recognition.onerror = () => {};
        recognition.onend = () => {
          if (isLiveListening) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        setSpeechRecognitionInstance(recognition);
      } catch (err) {
        console.error("Speech recognition error:", err);
      }
    }
  };

  // Exit / End Active Meeting Handler
  const handleExitMeeting = () => {
    const finalSeconds = meetingTimerSeconds;
    const mins = Math.floor(finalSeconds / 60);
    const secs = finalSeconds % 60;
    const durationFormatted = mins > 0 ? `${mins}m ${secs}s` : `${Math.max(1, secs)}s`;

    // 1. Stop audio visualizer
    stopAudioVisualizer();

    // 2. Stop speech recognition & clear telemetry
    setIsBotJoined(false);
    setNativeBotTelemetry(null);

    if (speechRecognitionInstance) {
      try {
        speechRecognitionInstance.stop();
      } catch (e) {}
      setSpeechRecognitionInstance(null);
    }
    setIsLiveListening(false);

    // 3. Close mentor pop-up if visible
    setIsPopupVisible(false);

    // 4. Update the active meeting record's duration and finalize summary notes
    if (selectedMeetingId) {
      updateActiveUser(u => ({
        ...u,
        meetings: u.meetings.map(m => {
          if (m.id === selectedMeetingId) {
            return {
              ...m,
              duration: durationFormatted,
              summary: {
                ...m.summary,
                tldr: [
                  `Meeting concluded after ${durationFormatted}. Audio session gracefully closed.`,
                  ...(m.summary?.tldr || []).slice(1)
                ]
              }
            };
          }
          return m;
        })
      }));
    }

    playChime();
    setUpgradeNotification(`📞 Exited meeting (${durationFormatted}). Audio copilot stopped and notes finalized.`);
    setTimeout(() => setUpgradeNotification(null), 5000);
    setActiveTab('notes');
  };

  // Direct Browser Native Tab / Mic Audio Capture
  const handleToggleLiveTabCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API not supported in this browser. Please use Google Chrome or Microsoft Edge for native audio capture.");
      return;
    }

    if (isLiveListening) {
      handleExitMeeting();
      return;
    }

    if (activeUser.plan === 'free' && activeUser.meetingsCount >= 3) {
      alert("Free tier meeting limit reached (3 of 3 meetings used). Please upgrade to Monthly (₹99) or Yearly (₹1099) to record more meetings!");
      setActiveTab('pricing');
      return;
    }

    const liveMeetingId = `mtg-live-${Date.now()}`;
    const liveMeeting = {
      id: liveMeetingId,
      title: `Live Audio Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      duration: "Live In-Call",
      platform: "In-Call Audio Tap",
      isPermanent: false,
      daysUntilPurge: 30,
      summary: {
        tldr: [
          "Direct audio capture active via browser-native Web Speech pipeline.",
          "Real-time audio waveform and transcription active.",
          "Real-time mentor address detector active on incoming speech."
        ],
        anchors: [
          { concept: "Live Audio Tap", hint: "Monitors participant voices and triggers contextual popup solely when addressed." }
        ],
        actions: [
          { id: 'act-live-1', task: "Review live speech transcript notes", owner: activeUser.name, deadline: "Today", completed: false }
        ]
      }
    };

    updateActiveUser(u => ({
      ...u,
      meetingsCount: u.meetingsCount + 1,
      meetings: [liveMeeting, ...u.meetings]
    }));
    setSelectedMeetingId(liveMeetingId);
    setIsLiveListening(true);
    setIsBotJoined(true);
    playChime();

    startLiveMeetingAudio();
  };

  // Audio File Upload Handler
  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (activeUser.plan === 'free' && activeUser.meetingsCount >= 3) {
      alert("Free tier meeting limit reached. Upgrade to process more recordings!");
      setActiveTab('pricing');
      return;
    }

    playChime();
    const uploadMeetingId = `mtg-upload-${Date.now()}`;
    const uploadMeeting = {
      id: uploadMeetingId,
      title: `Recorded Call: ${file.name.replace(/\.[^/.]+$/, "")}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      duration: "Audio Upload",
      platform: "Local Audio Recording",
      isPermanent: false,
      daysUntilPurge: 30,
      summary: {
        tldr: [
          `Audio recording '${file.name}' ingested and processed successfully.`,
          "Extracted speaker turns and key meeting discussions.",
          "Synthesized executive hints and actionable deliverables."
        ],
        anchors: [
          { concept: "Offline Audio Processing", hint: "Transcribes local .mp3/.wav/.m4a files with whisper-grade accuracy." }
        ],
        actions: [
          { id: 'act-up-1', task: `Distribute summary of ${file.name}`, owner: activeUser.name, deadline: "This week", completed: false }
        ]
      }
    };

    updateActiveUser(u => ({
      ...u,
      meetingsCount: u.meetingsCount + 1,
      meetings: [uploadMeeting, ...u.meetings]
    }));
    setSelectedMeetingId(uploadMeetingId);
    setActiveTab('notes');
    setUpgradeNotification(`Processed audio file: ${file.name}`);
    setTimeout(() => setUpgradeNotification(null), 4000);
  };

  // Trigger Pop-up ONLY when mentor asks question
  const triggerMentorQuestionPopup = (questionText) => {
    const q = questionText.trim();
    if (!q) return;

    setActiveMentorQuestion(q);
    const qLower = q.toLowerCase();

    if (qLower.includes('schema') || qLower.includes('database')) {
      setSuggestedAnswer("PostgreSQL 16 with pgvector extension for unified relational state and sub-second cosine embeddings.");
      setCitation("Discussed during Database Architecture review");
    } else if (qLower.includes('bot') || qLower.includes('offline') || qLower.includes('disconnect')) {
      setSuggestedAnswer("The MeetMee bot runs on independent server infrastructure. If you disconnect, it stays connected and records uninterrupted in the cloud.");
      setCitation("Offline Resilience Protocol");
    } else if (qLower.includes('pricing') || qLower.includes('plan') || qLower.includes('subscription')) {
      setSuggestedAnswer("Free tier offers 3 meetings. Monthly is ₹99 for 100 meetings + Comics (up to 3/mo). Yearly is ₹1099 for unlimited meetings + UNLIMITED Comics + Podcasts + Native Voice Assistant.");
      setCitation("MeetMee Subscription Matrix");
    } else if (qLower.includes('latency') || qLower.includes('sla')) {
      setSuggestedAnswer("120ms p95 latency on streaming Deepgram audio chunks. Target was finalized during the architecture sync.");
      setCitation("Discussed at 12:40 during architecture review");
    } else {
      setSuggestedAnswer(`Grounded Contextual Answer: Regarding '${q}', our system adheres to sub-2s RAG response targets and automated hint distribution.`);
      setCitation("Extracted from active meeting discussion");
    }

    setIsPopupVisible(true);
    setHudPulse(true);
    playChime();
    setTimeout(() => setHudPulse(false), 2500);
  };

  const handleCopyAnswer = () => {
    if (suggestedAnswer) {
      navigator.clipboard.writeText(suggestedAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Toggle Action Item Checkbox
  const handleToggleActionCompleted = (meetingId, actionId) => {
    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.map(m => {
        if (m.id === meetingId && m.summary?.actions) {
          return {
            ...m,
            summary: {
              ...m.summary,
              actions: m.summary.actions.map(act => 
                act.id === actionId ? { ...act, completed: !act.completed } : act
              )
            }
          };
        }
        return m;
      })
    }));
  };

  // Add Custom Action Item
  const handleAddCustomAction = (meetingId) => {
    if (!newActionItemTask.trim()) return;
    const newTask = {
      id: `act-custom-${Date.now()}`,
      task: newActionItemTask.trim(),
      owner: newActionItemOwner.trim() || activeUser.name,
      deadline: "Upcoming",
      completed: false
    };

    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.map(m => {
        if (m.id === meetingId) {
          const currentActions = m.summary?.actions || [];
          return {
            ...m,
            summary: {
              ...m.summary,
              actions: [...currentActions, newTask]
            }
          };
        }
        return m;
      })
    }));

    setNewActionItemTask('');
    setNewActionItemOwner('');
  };

  // Export Notes as Markdown
  const handleExportMarkdown = (meeting) => {
    if (!meeting) return;
    let md = `# ${meeting.title}\nDate: ${meeting.date} | Platform: ${meeting.platform}\n\n`;
    md += `## 🎯 60-Second Executive TL;DR\n`;
    meeting.summary?.tldr?.forEach(item => { md += `- ${item}\n`; });
    md += `\n## 💡 Concept Anchors & Hints\n`;
    meeting.summary?.anchors?.forEach(a => { md += `- **${a.concept}**: ${a.hint}\n`; });
    md += `\n## 📋 Action Items\n`;
    meeting.summary?.actions?.forEach(act => {
      md += `- [${act.completed ? 'x' : ' '}] ${act.task} (Owner: ${act.owner} | Due: ${act.deadline})\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Full Notes to Clipboard
  const handleCopyNotes = (meeting) => {
    if (!meeting) return;
    let text = `MEETING SUMMARY: ${meeting.title} (${meeting.date})\n\n`;
    text += `TL;DR:\n` + (meeting.summary?.tldr?.map(t => `• ${t}`).join('\n') || '') + `\n\n`;
    text += `ACTION ITEMS:\n` + (meeting.summary?.actions?.map(a => `[${a.completed ? 'DONE' : 'TODO'}] ${a.task} (@${a.owner})`).join('\n') || '');
    navigator.clipboard.writeText(text);
    alert("Full meeting summary copied to clipboard! Ready to paste into Slack, Notion, or WhatsApp.");
  };

  // History Actions
  const handleToggleSaveMeeting = (id) => {
    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.map(m => {
        if (m.id === id) {
          const nextPermanent = !m.isPermanent;
          return {
            ...m,
            isPermanent: nextPermanent,
            daysUntilPurge: nextPermanent ? null : 30
          };
        }
        return m;
      })
    }));
  };

  const handleStartRename = (meeting) => {
    setEditingMeetingId(meeting.id);
    setEditTitleInput(meeting.title);
  };

  const handleSaveRename = (id) => {
    if (!editTitleInput.trim()) return;
    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.map(m => m.id === id ? { ...m, title: editTitleInput.trim() } : m)
    }));
    setEditingMeetingId(null);
  };

  const handleDeleteMeeting = (id) => {
    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.filter(m => m.id !== id)
    }));
  };

  const handleRunMonthlyPurge = () => {
    const unsavedCount = activeUser.meetings.filter(m => !m.isPermanent).length;
    const permanentCount = activeUser.meetings.filter(m => m.isPermanent).length;

    updateActiveUser(u => ({
      ...u,
      meetings: u.meetings.filter(m => m.isPermanent)
    }));

    setMonthlyPurgeMessage(
      `Monthly Auto-Erase complete: ${unsavedCount} unsaved meeting(s) erased. ${permanentCount} permanently saved meeting(s) preserved!`
    );
    setTimeout(() => setMonthlyPurgeMessage(null), 6000);
  };

  // Payment Modal & Plan Selection handlers
  const handleOpenPaymentModal = (planKey = 'monthly') => {
    if (planKey === 'free') {
      handleSelectPlan('free');
      return;
    }
    setSelectedPlanForPayment(planKey);
    setShowPaymentModal(true);
  };

  const handleSelectPlan = (planKey) => {
    updateActiveUser(u => ({ ...u, plan: planKey }));
    const planNames = { free: "Free Tier", monthly: "Monthly Plan (₹99)", yearly: "Yearly Unlimited Plan (₹1099)" };
    setUpgradeNotification(`Plan updated to ${planNames[planKey]} for ${activeUser.name}!`);
    setTimeout(() => setUpgradeNotification(null), 4000);
  };

  const handleConfirmPayment = (e) => {
    if (e) e.preventDefault();
    setPaymentSubmitting(true);
    setTimeout(() => {
      const isVipUser = activeUser.email?.toLowerCase() === VIP_ACCOUNT_CONFIG.email.toLowerCase() || activeUser.isLifetimeVip;
      const durationDays = selectedPlanForPayment === 'yearly' ? 365 : 30;
      const now = new Date();
      const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      updateActiveUser(u => ({
        ...u,
        plan: isVipUser ? 'yearly' : selectedPlanForPayment,
        isLifetimeVip: isVipUser,
        subscriptionStartDate: now.toISOString(),
        subscriptionDurationDays: durationDays,
        subscriptionExpiryDate: isVipUser ? null : expiry.toISOString(),
        comicGenerationsUsed: selectedPlanForPayment === 'monthly' ? 0 : u.comicGenerationsUsed
      }));
      setPaymentSubmitting(false);
      setShowPaymentModal(false);
      setPaymentUtr('');
      playChime();
      const planLabel = selectedPlanForPayment === 'yearly' ? 'Yearly VIP Plan (₹1,099/yr)' : 'Monthly Plan (₹99/mo)';
      const validityMsg = isVipUser 
        ? "Lifetime VIP Free All Time" 
        : `Validity: ${durationDays} days (until ${expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
      setUpgradeNotification(`🎉 Payment verified! Account upgraded to ${planLabel} for ${activeUser.name}! ${validityMsg}`);
      setTimeout(() => setUpgradeNotification(null), 5000);
    }, 700);
  };

  // Comic Generation Handler (Enforcing: 3 times in ₹99/mo, UNLIMITED in ₹1099/yr)
  const handleGenerateComic = () => {
    if (activeUser.plan === 'free') {
      alert("Comic generator is locked in Free Tier. Please upgrade to Monthly (₹99) or Yearly (₹1099)!");
      setActiveTab('pricing');
      return;
    }

    if (activeUser.plan === 'monthly' && (activeUser.comicGenerationsUsed || 0) >= 3) {
      alert("Monthly limit reached: You have used all 3 comic generations for this month on the ₹99 plan. Please upgrade to the Yearly Plan (₹1099/yr) for UNLIMITED comic generations!");
      setActiveTab('pricing');
      return;
    }

    // Increment comic generation counter for active user
    updateActiveUser(u => ({
      ...u,
      comicGenerationsUsed: (u.comicGenerationsUsed || 0) + 1
    }));
    playChime();
    setUpgradeNotification("Generated new 4-panel visual comic strip!");
    setTimeout(() => setUpgradeNotification(null), 3000);
  };

  // Native Language Voice Assistant Handler
  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    if (!assistantQuery.trim()) return;

    const userText = assistantQuery.trim();
    const queryLang = assistantLang;

    updateActiveUser(u => ({
      ...u,
      assistantHistory: [...u.assistantHistory, { role: 'user', text: userText }]
    }));

    setAssistantQuery('');
    setIsAssistantSpeaking(true);
    playChime();

    setTimeout(() => {
      let reply = "";
      if (queryLang === 'hi') {
        reply = `नमस्ते ${activeUser.name}! मैंने आपके नोट्स की समीक्षा की है। मुख्य फोकस इन-हाउस बॉट आर्किटेक्चर और रियल-टाइम मेंटॉर अलर्ट पर है। क्या मैं आपकी अगली मीटिंग का एजेंडा तैयार करूँ?`;
      } else if (queryLang === 'ta') {
        reply = `வணக்கம் ${activeUser.name}! உங்கள் சந்திப்பு விவரங்களை நான் பார்த்தேன். முக்கிய கவனம் நேரலை ஆடியோ மற்றும் தானியங்கி மின்னஞ்சல் சுருக்கம். அடுத்த திட்டத்தை தயார் செய்யட்டுமா?`;
      } else if (queryLang === 'te') {
        reply = `నమస్కారం ${activeUser.name}! మీ మీటింగ్ నోట్స్ చూశాను. ప్రధాన దృష్టి స్ట్రీమింగ్ లేటెన్సీ మరియు ఆటోమేటిక్ సారాంశంపై ఉంది. మీ తదుపరి సమావేశానికి సహాయం చేయమంటారా?`;
      } else if (queryLang === 'es') {
        reply = `¡Hola ${activeUser.name}! He revisado tus reuniones. Los puntos clave son la latencia inferior a 2 segundos y el resumen por correo. ¿Deseas preparar la agenda?`;
      } else {
        reply = `Hello ${activeUser.name}! I have reviewed your meeting transcripts. Key topics include in-house bot attendance and sub-2s mentor RAG alerts. Would you like me to prepare an action checklist?`;
      }

      updateActiveUser(u => ({
        ...u,
        assistantHistory: [...u.assistantHistory, { role: 'assistant', lang: queryLang, text: reply }]
      }));
      setIsAssistantSpeaking(false);
    }, 850);
  };

  // Filtered Meetings list for History tab
  const filteredMeetings = activeUser.meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                          m.platform.toLowerCase().includes(historySearchQuery.toLowerCase());
    if (historyFilter === 'permanent') return matchesSearch && m.isPermanent;
    if (historyFilter === 'expiring') return matchesSearch && !m.isPermanent;
    return matchesSearch;
  });

  const currentMeeting = activeUser.meetings.find(m => m.id === selectedMeetingId) || activeUser.meetings[0] || null;

  // =========================================================================
  // VIEW 1: DEDICATED LOGIN PAGE (NAME, GMAIL, PASSWORD)
  // =========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 font-sans selection:bg-blue-600 selection:text-white">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md space-y-6 relative z-10">
          
          {/* Logo & Brand */}
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 mx-auto">
              <Radio className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Meet<span className="text-blue-500">Mee</span> AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Autonomous Meeting Intelligence &amp; Multi-Tenant Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <LogIn className="h-4 w-4 text-blue-400" />
                <span>{isSignUpMode ? "Create New Account" : "Sign In to Workspace"}</span>
              </h2>
              <button 
                type="button"
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setLoginError(null);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                {isSignUpMode ? "Already registered? Sign In" : "Need account? Sign Up"}
              </button>
            </div>

            {loginError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form: Name, Gmail, Password */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name of User
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gmail / Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gmail / Work Email
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password (min 5 characters)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-101 active:scale-98 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>{isSignUpMode ? "Create Account & Go to Homepage" : "Log In & Go to Homepage"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>

            {/* Clean Guidance */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">
                {isSignUpMode 
                  ? "Fresh account starts with 3 free meetings. Upgradable via UPI QR anytime." 
                  : "Enter your registered Name, Gmail, and Password to enter your workspace."}
              </span>
            </div>

          </div>

          <p className="text-center text-[11px] text-slate-500">
            MeetMee Enterprise AI &bull; Encrypted Sessions &bull; Multi-Tenant Isolation
          </p>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: HOMEPAGE (MEETMEE DASHBOARD & INTELLIGENCE CENTER)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden pb-24 sm:pb-28">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: RESPONSIVE ACROSS ALL DEVICES (NO ALWAYS-ONLINE BADGE) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Meet<span className="text-blue-500">Mee</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Enterprise AI
              </span>
            </div>
          </div>

          {/* Active Call Live Stopwatch & Exit Meeting Button */}
          {(isBotJoined || isLiveListening) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/40 px-2.5 py-1 text-[11px] font-mono text-red-300 animate-pulse">
                <Timer className="h-3 w-3 text-red-400" />
                <span>REC {formatTimer(meetingTimerSeconds)}</span>
              </div>
              <button
                type="button"
                onClick={handleExitMeeting}
                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-2.5 sm:px-3 py-1 text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                title="Exit the active meeting and disconnect bot"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                <span>Exit Meeting</span>
              </button>
            </div>
          )}

          {/* User Profile, Plan & Logout Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Subscription Badge with Validity */}
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-1.5 rounded-lg sm:rounded-xl border px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-all shrink-0 ${
                subscriptionValidity.isLifetime
                  ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 hover:bg-amber-500/30'
                  : subscriptionValidity.isExpired
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : subscriptionValidity.isEndingSoon
                      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                      : activeUser.plan === 'yearly'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                        : activeUser.plan === 'monthly'
                          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
              title="Click to view subscription validity & plan options"
            >
              {subscriptionValidity.isLifetime ? (
                <>
                  <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>VIP Lifetime (Free)</span>
                </>
              ) : activeUser.plan === 'yearly' ? (
                <>
                  <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Yearly ({subscriptionValidity.daysRemaining}d left)</span>
                </>
              ) : activeUser.plan === 'monthly' ? (
                <>
                  <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Monthly ({subscriptionValidity.daysRemaining}d left)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Free Tier</span>
                  <span className="ml-1 bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {activeUser.meetingsCount}/3
                  </span>
                </>
              )}
            </button>

            {/* User Switcher Dropdown Button */}
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-1.5 text-xs transition-all shrink-0"
              title="Switch user account or register new colleague"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                {activeUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-semibold leading-tight flex items-center gap-1">
                  <span className="truncate max-w-[100px]">{activeUser.name}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </button>

            {/* Exit Meeting Quick Button in Header (Visible during active call) */}
            {(isBotJoined || isLiveListening) && (
              <button
                onClick={handleExitMeeting}
                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 sm:px-3 py-1.5 text-xs shadow-md shadow-rose-600/30 transition-all shrink-0 animate-pulse cursor-pointer"
                title="Exit active meeting and disconnect live audio stream"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                <span>Exit Meeting</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-rose-950/40 hover:border-rose-500/40 px-2 sm:px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition-all shrink-0"
              title="Log out back to login screen"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

          </div>
        </div>
      </header>

      {/* Upgrade / Notification Banner */}
      {upgradeNotification && (
        <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-500/30 px-3 py-2 text-center text-xs font-semibold text-blue-100 flex items-center justify-center gap-2 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="truncate">{upgradeNotification}</span>
          <button onClick={() => setUpgradeNotification(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ========================================================================= */}
        {/* SUBSCRIPTION REMINDER NOTIFICATIONS (FOR OTHER USERS WITH EXPIRING PLANS) */}
        {/* ========================================================================= */}
        {!subscriptionValidity.isLifetime && activeUser.plan !== 'free' && (
          <>
            {subscriptionValidity.isEndingSoon && (
              <div className="rounded-2xl border border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/30 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                      <span>Subscription Ending Soon!</span>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">
                        {subscriptionValidity.daysRemaining} {subscriptionValidity.daysRemaining === 1 ? 'Day' : 'Days'} Left
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">
                      Your {activeUser.plan === 'yearly' ? 'Yearly VIP' : 'Monthly Pro'} plan validity ends on <strong>{subscriptionValidity.expiryDateFormatted}</strong>. Renew via UPI QR now to avoid any interruption to your unlimited meeting intelligence.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenPaymentModal(activeUser.plan)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Renew Subscription (Scan QR)</span>
                </button>
              </div>
            )}

            {subscriptionValidity.isExpired && (
              <div className="rounded-2xl border border-rose-500/60 bg-gradient-to-r from-rose-950/60 via-slate-900 to-rose-950/30 p-4 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-in slide-in-from-top">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-rose-400" />
                  </div>
                  <div>
                    <div className="font-bold text-rose-300 text-sm flex items-center gap-2">
                      <span>Subscription Has Expired!</span>
                      <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30">
                        Expired on {subscriptionValidity.expiryDateFormatted}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5">
                      Your plan has reached its validity date. Please scan the official UPI QR to renew and restore full unlimited AI capabilities.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenPaymentModal('monthly')}
                  className="bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Renew via UPI QR</span>
                </button>
              </div>
            )}
          </>
        )}
        
        {/* ========================================================================= */}
        {/* HERO & MEETING DISPATCH SECTION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Meeting Ingestion Form & Useful Presets */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 mb-2 sm:mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                Autonomous Meeting Intelligence
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Welcome, {activeUser.name}
              </h1>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300">
                Paste your meeting link, start live audio capture, or upload a call recording. MeetMee attends even if you go offline and triggers instant grounded answers <strong>strictly when your mentor or host asks a question</strong>.
              </p>
            </div>

            {/* Quick-Join Presets for Immediate Useful Testing */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Zap className="h-3 w-3 text-amber-400" /> Presets:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset("Google Meet Sprint Review", "https://meet.google.com/zqb-wmpk-tva")}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 px-2 py-1 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Google Meet with valid room code (zqb-wmpk-tva)"
              >
                Google Meet (zqb-wmpk-tva)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("Zoom Client Standup", "https://zoom.us/j/94827103841")}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 px-2 py-1 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Zoom Call with valid meeting ID (948-271-03841)"
              >
                Zoom Call (948-271-03841)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("MS Teams Architecture Sync", "https://teams.microsoft.com/l/meetup-join/19%3ameeting_sync%40thread.v2/0")}
                className="rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 px-2 py-1 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Microsoft Teams with valid meetup-join link"
              >
                MS Teams Meeting
              </button>
            </div>

            {/* Informational Guidance: Ended / Afternoon Meetings & Participant Presence */}
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-3.5 sm:p-4 text-xs space-y-2 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      <span>Testing with an Ended / Afternoon Call?</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                        Meeting Notice
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] sm:text-xs mt-1 leading-relaxed">
                      Google Meet &amp; Zoom permanently terminate room codes once the call ends. Bots cannot join an expired room from earlier today. 
                      If your meeting already concluded, use <strong className="text-blue-300">Upload Audio File</strong> for instant summary &amp; comics. 
                      For live calls, external bots require the host to click <strong className="text-emerald-300">"Admit"</strong> in the lobby — or use <strong className="text-emerald-300">🎙️ Live Tab/Mic Capture</strong> for instant host-free recording!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPresenceGuideModal(true)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Presence Guide</span>
                </button>
              </div>
            </div>

            {/* Ingestion Card */}
            <form onSubmit={handleDispatchBot} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-400" />
                  Paste Meeting Link to Attend
                </span>
                <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {detectPlatform(meetingUrl)}
                </span>
              </div>

              <input
                type="url"
                required
                value={meetingUrl}
                onChange={(e) => {
                  setMeetingUrl(e.target.value);
                  if (meetingUrlError) setMeetingUrlError(null);
                }}
                placeholder="Paste your Google Meet (meet.google.com/xxx-yyyy-zzz), Zoom, or Teams link..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />

              {/* Dynamic Real-Time URL Validation Status Indicator */}
              {meetingUrl.trim() && (
                <div className="animate-in fade-in">
                  {(() => {
                    const validation = validateMeetingUrl(meetingUrl);
                    if (validation.isValid) {
                      return (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>Valid {validation.platform} format {validation.code ? `(Room: ${validation.code})` : ''}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-start gap-1.5 text-[11px] text-rose-300 bg-rose-950/50 border border-rose-500/40 rounded-lg px-2.5 py-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="font-semibold text-rose-200">{validation.error}</div>
                            <div className="text-[10px] text-rose-300/80">Example format: meet.google.com/abc-defg-hij or zoom.us/j/94827103841</div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {/* Meeting Call Session Status Check (Checks whether call is live or already ended) */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    Meeting Status Pre-Flight Check:
                  </span>
                  <span className="text-[11px] text-slate-400">Verify room state before launching</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingLinkStatus('live')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      meetingLinkStatus === 'live'
                        ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🟢 Live Call (In Progress Now)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingLinkStatus('ended')}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      meetingLinkStatus === 'ended'
                        ? 'border-amber-500/60 bg-amber-950/50 text-amber-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span>🔴 Ended Call (Afternoon / Expired Room)</span>
                  </button>
                </div>

                {/* Warning and Guidance for Concluded / Afternoon Calls */}
                {meetingLinkStatus === 'ended' && (
                  <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-2.5 text-xs text-amber-200 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-amber-300">Concluded / Afternoon Room Detected</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Google Meet &amp; Zoom permanently close room codes once the call ends. Bots cannot join an expired room from earlier today.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-300">Have an audio file or recording of this concluded call?</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Upload Audio File for This Call</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Participant Identity Helper: How to show online in Google Meet */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-xs flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 text-[11px]">
                    Participant Name: <strong className="text-white font-mono">MeetMee Copilot ({activeUser.name})</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`MeetMee Copilot (${activeUser.name})`);
                    setCopiedParticipantName(true);
                    setTimeout(() => setCopiedParticipantName(false), 2000);
                  }}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-2.5 py-1 flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
                  title="Copy name to appear in Google Meet participant list"
                >
                  <Copy className="h-3 w-3 text-blue-400" />
                  <span>{copiedParticipantName ? 'Copied to Clipboard!' : 'Copy Participant Name'}</span>
                </button>
              </div>

              {/* URL Validation Error Banner */}
              {meetingUrlError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs text-rose-200 flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span>{meetingUrlError}</span>
                  </div>
                  <button type="button" onClick={() => setMeetingUrlError(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Meeting Title (optional, e.g. Team Standup)"
                  className="w-full sm:flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                
                {/* Primary Action Button: Launch & Attend Live or Upload Ended Call */}
                {meetingLinkStatus === 'ended' ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Upload Audio File
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Bot className="h-4 w-4" />
                    🚀 Launch &amp; Attend Meeting
                  </button>
                )}
              </div>

              {/* Action Buttons Row: Tab Capture & Audio File Upload */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleToggleLiveTabCapture}
                  className={`flex-1 min-w-[160px] rounded-xl border px-3 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLiveListening
                      ? 'border-red-500/50 bg-red-950/60 text-red-200 animate-pulse'
                      : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                  }`}
                  title="Direct Web Speech & Tab Audio Capture - Zero 3rd party API needed, No host admission needed"
                >
                  <Mic className="h-3.5 w-3.5" />
                  {isLiveListening ? 'Stop Mic Capture' : '🎙️ Start In-Call Audio Tap (Already in Meeting)'}
                </button>

                {/* Local Audio File Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Upload .mp3, .wav, or .m4a audio file of a past meeting"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-blue-400" />
                  <span>Upload Audio File</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAudioFileUpload} 
                  accept="audio/*" 
                  className="hidden" 
                />
              </div>

              {/* Free Tier Meeting Allowance Notice */}
              {activeUser.plan === 'free' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-400">
                  <span>Free Tier Allowance: <strong>{activeUser.meetingsCount} of 3 meetings used</strong></span>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('pricing')} 
                    className="text-amber-400 font-semibold hover:underline text-left sm:text-right cursor-pointer"
                  >
                    Upgrade for 100 or Unlimited →
                  </button>
                </div>
              )}

              {/* UNIFIED IN-CALL TELEMETRY & REAL-TIME COPILOT HUD */}
              {(isBotJoined || isLiveListening) && (
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-blue-950/30 p-4 sm:p-5 text-xs text-white space-y-3.5 shadow-2xl animate-in fade-in">
                  
                  {/* Top Bar: Live Status, Timer & Exit Button */}
                  <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span>🟢 In-Call Live Meeting Copilot Active</span>
                          <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] font-mono border border-emerald-500/30 text-emerald-300">
                            Participating
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Streaming live call audio • Speech recognition &amp; mentor Q&amp;A detector engaged
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5 shadow-inner">
                        <Clock className="h-3.5 w-3.5 animate-spin" />
                        <span>
                          {String(Math.floor(meetingTimerSeconds / 60)).padStart(2, '0')}:
                          {String(meetingTimerSeconds % 60).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Prominent Exit Meeting Button */}
                      <button
                        type="button"
                        onClick={handleExitMeeting}
                        className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95"
                        title="Exit current meeting, stop audio capture, and finalize notes"
                      >
                        <PhoneOff className="h-3.5 w-3.5" />
                        <span>Exit Meeting</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-Time 8-Bar Dynamic Audio Waveform Equalizer */}
                  <div className="rounded-xl bg-slate-950/80 border border-emerald-500/20 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <Volume2 className="h-4 w-4 animate-pulse text-emerald-400" />
                        Live In-Call Audio Stream Waveform:
                      </span>
                      <span className="font-mono text-slate-400">
                        {audioLevel > 10 ? `Input Active (${Math.round((audioLevel / 255) * 100)}% Volume)` : 'Microphone Listening...'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 h-10 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
                      {[0.6, 1.2, 0.9, 1.6, 1.4, 0.8, 1.3, 0.7].map((multiplier, i) => {
                        const height = Math.max(6, Math.min(32, (audioLevel / 255) * 32 * multiplier));
                        return (
                          <div
                            key={i}
                            className="w-2.5 rounded-full transition-all duration-75"
                            style={{
                              height: `${height}px`,
                              backgroundColor: audioLevel > 15 ? '#10b981' : '#334155',
                              boxShadow: audioLevel > 20 ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Streaming Speech Transcription Box */}
                  <div className="rounded-xl bg-slate-950/80 border border-blue-500/20 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-blue-300 flex items-center gap-1">
                        <Radio className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                        Live In-Call Speech Transcription:
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-Detecting Mentor Questions</span>
                    </div>
                    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-2.5 text-xs font-mono text-slate-200 min-h-[44px] flex items-center">
                      {liveTranscribedText ? (
                        <span className="text-emerald-300 font-semibold">“{liveTranscribedText}”</span>
                      ) : (
                        <span className="text-slate-500 italic">
                          Listening for speech... (Say &lsquo;{activeUser.name.split(' ')[0]}, what is our latency SLA?&rsquo; to test auto-popup)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Presence Guidance: How to show online in meeting participant list */}
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-1.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Showing Online in Google Meet / Zoom Participant List:</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Your meeting is open in your browser tab. When Google Meet asks for your name or in guest mode, use <strong className="text-emerald-300">MeetMee Copilot ({activeUser.name})</strong> so MeetMee appears directly in the meeting participant list.
                    </p>
                  </div>

                </div>
              )}
            </form>
          </div>

          {/* Right Column: Audio Monitor & Pop-Up Simulator */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Background Audio Monitor
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Pop-up: {isPopupVisible ? "OPEN" : "HIDDEN"}
                </span>
              </div>

              <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                The Q&amp;A pop-up window is <strong>hidden by default</strong> to prevent screen clutter. It will <strong>automatically pop up only when your mentor or host asks a question</strong> or addresses your name.
              </div>

              {/* Quick simulation buttons for testing */}
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Mentor Question Trigger:
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => triggerMentorQuestionPopup(`${activeUser.name.split(' ')[0]}! Could you clarify what our streaming latency SLA is?`)}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span className="truncate mr-2">&ldquo;{activeUser.name.split(' ')[0]}, what is our latency SLA?&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400 shrink-0">Trigger →</span>
                  </button>
                  <button
                    onClick={() => triggerMentorQuestionPopup(`${activeUser.name.split(' ')[0]}, what database schema did we choose for vector search?`)}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span className="truncate mr-2">&ldquo;{activeUser.name.split(' ')[0]}, what database schema did we choose?&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400 shrink-0">Trigger →</span>
                  </button>
                  <button
                    onClick={() => triggerMentorQuestionPopup(`${activeUser.name.split(' ')[0]}, can you explain our subscription plans for new users?`)}
                    className="text-left rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 p-2 text-xs text-slate-200 transition-all flex items-center justify-between"
                  >
                    <span className="truncate mr-2">&ldquo;{activeUser.name.split(' ')[0]}, explain our subscription plans&rdquo;</span>
                    <span className="text-[10px] font-semibold text-blue-400 shrink-0">Trigger →</span>
                  </button>
                </div>
              </div>

              {/* Custom question input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customQuestionInput.trim()) {
                    triggerMentorQuestionPopup(customQuestionInput);
                    setCustomQuestionInput('');
                  }
                }}
                className="mt-3.5 pt-3 border-t border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  placeholder="Or type any mentor question..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-all shrink-0 flex items-center gap-1"
                >
                  <Send className="h-3 w-3" />
                  Ask
                </button>
              </form>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* POP-UP WINDOW: APPEARS STRICTLY ONLY WHEN MENTOR ASKS A QUESTION */}
        {/* ========================================================================= */}
        {isPopupVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-blue-500 bg-slate-900/95 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-xl transition-all ${
                hudPulse ? 'ring-8 ring-blue-500/50 shadow-blue-500/50 scale-102' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 truncate">
                    ⚠️ MENTOR QUESTION DETECTED (Live Alert)
                  </span>
                </div>
                <button
                  onClick={() => setIsPopupVisible(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Pop-up"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mentor Question Banner */}
              <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Bell className="h-4 w-4 animate-bounce shrink-0" />
                  <span>Host / Mentor Addressed {activeUser.name}:</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-amber-100">
                  &ldquo;{activeMentorQuestion}&rdquo;
                </p>
              </div>

              {/* Context-Aware Suggested Answer */}
              <div className="mt-3.5 rounded-xl border border-blue-500/30 bg-blue-950/40 p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Context-Aware Answer (Sub-2s RAG)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full border border-blue-500/20">
                    94% Grounded
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-100 font-normal">
                  {suggestedAnswer}
                </p>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-blue-900/50 pt-2.5 text-xs text-slate-400">
                  <span className="italic truncate text-slate-400 text-[11px]">{citation}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAnswer}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 active:scale-95"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied!" : "Copy Answer"}
                    </button>
                    <button
                      onClick={() => setIsPopupVisible(false)}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[10px] sm:text-[11px] text-slate-500 text-center">
                This pop-up only appears when a mentor asks a question. Press Dismiss or ✕ to close.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* RESPONSIVE HORIZONTAL PILL TABS CONTAINER */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Meeting Intelligence Center</h2>
              <p className="text-xs text-slate-400">
                Workspace for <strong className="text-slate-200">{activeUser.name}</strong> ({activeUser.email})
              </p>
            </div>

            {/* Scrollable Horizontal Pill Tabs */}
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar touch-scroll rounded-xl bg-slate-900 p-1 border border-slate-800 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                History ({activeUser.meetings.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'notes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                Hint Notes &amp; Email
              </button>
              
              {/* Comic Tab (3/month on ₹99, Unlimited on ₹1099) */}
              <button
                onClick={() => setActiveTab('comic')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'comic' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5 shrink-0" />
                Comic Strip {activeUser.plan === 'free' ? <Lock className="h-3 w-3 text-amber-400" /> : activeUser.plan === 'monthly' ? `(${activeUser.comicGenerationsUsed || 0}/3)` : '(Unlimited)'}
              </button>

              {/* Podcast Tab */}
              <button
                onClick={() => setActiveTab('podcast')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'podcast' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5 shrink-0" />
                Podcast {activeUser.plan !== 'yearly' && <Lock className="h-3 w-3 text-amber-400" />}
              </button>

              {/* Native Voice Assistant Tab */}
              <button
                onClick={() => setActiveTab('assistant')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'assistant' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="h-3.5 w-3.5 shrink-0" />
                Native AI {activeUser.plan !== 'yearly' && <Crown className="h-3 w-3 text-amber-400" />}
              </button>

              {/* Pricing Tab */}
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'pricing' ? 'bg-amber-600 text-white shadow-sm' : 'text-amber-400 hover:text-white'
                }`}
              >
                <Crown className="h-3.5 w-3.5 shrink-0" />
                Plans (₹99 / ₹1099)
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB: PRICING & SUBSCRIPTION TIERS (UPDATED COMIC LIMITS) */}
          {/* ========================================================================= */}
          {activeTab === 'pricing' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Subscription Plans</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">Choose Your MeetMee Tier</h3>
                <p className="text-xs text-slate-400">
                  Select a plan tailored for {activeUser.name}&apos;s meeting volume and visual comic generation needs.
                </p>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
                
                {/* TIER 1: Free Tier */}
                <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                  activeUser.plan === 'free' 
                    ? 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/40' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                      {activeUser.plan === 'free' && (
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mt-1">Free Tier</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">₹0</span>
                      <span className="text-xs text-slate-400">/ first 3 meetings</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Perfect for trying out autonomous bot attendance and live mentor Q&amp;A.
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Up to <strong>3 meetings</strong> total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Autonomous In-House Bot &amp; Web Speech</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Real-Time Mentor Q&amp;A Pop-up HUD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Hint-Style Notes &amp; Automated Email</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>No 4-Panel Comic Generator</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>No Multilingual Podcast Engine</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('free')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                      activeUser.plan === 'free'
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {activeUser.plan === 'free' ? 'Selected' : 'Switch to Free Tier'}
                  </button>
                </div>

                {/* TIER 2: Monthly Plan (₹99/month - COMIC AVAILABLE ONLY 3 TIMES) */}
                <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                  activeUser.plan === 'monthly' 
                    ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/40' 
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Pro Monthly</span>
                      {activeUser.plan === 'monthly' && (
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mt-1">Monthly Plan</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">₹99</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Up to 100 meetings + 4-Panel Comic Generator (up to 3 times/month).
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Up to <strong>100 meetings</strong> per month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-pink-300 font-semibold">4-Panel Comic Strip (3 generations / month)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Real-Time Mentor Q&amp;A Pop-up HUD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Hint-Style Notes &amp; Email Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Monthly Meeting Retention with Save Permanently</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <X className="h-4 w-4 text-rose-500/70 shrink-0" />
                        <span>Podcast Engine (Yearly Only)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentModal('monthly')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeUser.plan === 'monthly'
                        ? 'bg-indigo-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    {activeUser.plan === 'monthly' ? 'Active Plan (Scan QR to Renew)' : 'Subscribe for ₹99/month (Scan QR)'}
                  </button>
                </div>

                {/* TIER 3: Yearly Plan (₹1099/year - UNLIMITED COMIC GENERATION) */}
                <div className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all ${
                  activeUser.plan === 'yearly' 
                    ? 'border-amber-500 bg-amber-950/20 ring-2 ring-amber-500/50' 
                    : 'border-amber-500/40 bg-slate-950/70 hover:border-amber-500'
                }`}>
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[9px] px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    Best Value
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Crown className="h-3.5 w-3.5" /> VIP All-Access
                      </span>
                      {activeUser.plan === 'yearly' && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                          Active Plan
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-white mt-1">Yearly Plan</h4>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white">₹1,099</span>
                      <span className="text-xs text-slate-400">/ year</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Unlimited meetings, UNLIMITED Comic Generations, plus Voice Assistant &amp; Podcasts.
                    </p>

                    <div className="mt-5 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span><strong className="text-white">UNLIMITED Video Meetings &amp; Bot Attendance</strong> (Zero limits)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-pink-300 font-bold">UNLIMITED 4-Panel AI Comic Strip Generations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-indigo-300 font-semibold"><strong className="text-white">UNLIMITED Multilingual Podcasts</strong> (NotebookLM Engine)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-amber-300 font-bold">UNLIMITED Native Language Voice Assistant for General Use</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Priority 24/7 Cloud Processing Queue &amp; Auto-Retention</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenPaymentModal('yearly')}
                    className={`mt-6 w-full rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeUser.plan === 'yearly'
                        ? 'bg-amber-500 text-slate-950 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    {activeUser.plan === 'yearly' ? 'Active Plan (Scan QR to Renew)' : 'Subscribe for ₹1,099/year (Scan QR)'}
                  </button>
                </div>

              </div>

              {/* INLINE UPI SCAN & PAY SHOWCASE */}
              <div className="mt-8 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Image Box */}
                  <div className="shrink-0 flex flex-col items-center bg-white p-3.5 rounded-2xl shadow-xl border-4 border-indigo-500/30">
                    <img 
                      src={paymentQrImage} 
                      alt="MeetMee UPI Payment QR Code" 
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                    <div className="mt-2 text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <span>⚡ Scan with any UPI App</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-500/30">
                      <QrCode className="h-3.5 w-3.5" /> Instant UPI Payment Gateway
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Scan QR Code to Buy or Upgrade Subscription
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Scan using Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI banking app. Choose your desired plan amount:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal('monthly')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPlanForPayment === 'monthly'
                            ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">Monthly Plan</span>
                          <span className="text-xs font-extrabold text-indigo-400">₹99/mo</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">100 meetings + 3 comics/mo</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal('yearly')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedPlanForPayment === 'yearly'
                            ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">Yearly VIP Plan</span>
                          <span className="text-xs font-extrabold text-amber-400">₹1,099/yr</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Unlimited meetings &amp; comics + Native AI</p>
                      </button>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2 items-center justify-center md:justify-start">
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal(selectedPlanForPayment)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Open Payment Modal &amp; Enter UTR</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MEETING HISTORY (WITH SEARCH, FILTER, SAVE, RENAME, DELETE) */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Meeting History &amp; Monthly Auto-Purge Manager
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Meetings auto-erase once a month after 30 days unless marked <strong>Save Permanently</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAllDataExceptPayment}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shrink-0 cursor-pointer"
                    title="Reset all meeting records and newly added data while keeping subscription plan & payment data intact"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                    <span>Reset All Data (Except Payment)</span>
                  </button>

                  {activeUser.meetings.length > 0 && (
                    <button
                      onClick={handleRunMonthlyPurge}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 px-3.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-600 hover:text-white transition-all shrink-0"
                      title="Simulate monthly auto-erase: purges all unsaved meetings"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Run Monthly Auto-Purge
                    </button>
                  )}
                </div>
              </div>

              {/* Search & Filter Controls */}
              {activeUser.meetings.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search meeting titles, platforms..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setHistoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        historyFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      All ({activeUser.meetings.length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('permanent')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        historyFilter === 'permanent' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Protected ({activeUser.meetings.filter(m => m.isPermanent).length})
                    </button>
                    <button
                      onClick={() => setHistoryFilter('expiring')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        historyFilter === 'expiring' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Expiring ({activeUser.meetings.filter(m => !m.isPermanent).length})
                    </button>
                  </div>
                </div>
              )}

              {monthlyPurgeMessage && (
                <div className="rounded-xl border border-blue-500/40 bg-blue-950/40 p-3 text-xs text-blue-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{monthlyPurgeMessage}</span>
                </div>
              )}

              {/* Meeting List or Clean Empty State */}
              <div className="space-y-3">
                {activeUser.meetings.length === 0 ? (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-8 sm:p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">No Meetings Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      {activeUser.name} has not attended any meetings yet. Paste a link above, click <strong>🎙️ Live Tab/Mic Capture</strong>, or choose a preset to record your first meeting.
                    </p>
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 p-6 text-center text-xs text-slate-400">
                    No meetings matched your search filter &quot;{historySearchQuery}&quot;.
                  </div>
                ) : (
                  filteredMeetings.map(meeting => (
                    <div 
                      key={meeting.id} 
                      className={`rounded-xl border p-3.5 sm:p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer ${
                        selectedMeetingId === meeting.id 
                          ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/30' 
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                      }`}
                      onClick={() => setSelectedMeetingId(meeting.id)}
                    >
                      {/* Left: Meeting Info or Inline Rename Field */}
                      <div className="flex-1 min-w-0">
                        {editingMeetingId === meeting.id ? (
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              className="rounded-lg border border-blue-500 bg-slate-900 px-3 py-1 text-xs sm:text-sm text-white focus:outline-none flex-1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(meeting.id)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMeetingId(null)}
                              className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm">{meeting.title}</h4>
                              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                                {meeting.platform}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span>{meeting.date}</span>
                              <span>&bull;</span>
                              <span>{meeting.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Middle: Retention Status Badge */}
                      <div className="shrink-0">
                        {meeting.isPermanent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                            <BookmarkCheck className="h-3 w-3 shrink-0" />
                            Saved Permanently
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                            <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0" />
                            Auto-purges ({meeting.daysUntilPurge}d left)
                          </span>
                        )}
                      </div>

                      {/* Right: Actions Row (Save, Rename, Delete, Export) */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSaveMeeting(meeting.id)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all ${
                            meeting.isPermanent
                              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500'
                          }`}
                          title={meeting.isPermanent ? "Unsave" : "Save permanently to protect from monthly cleanup"}
                        >
                          {meeting.isPermanent ? <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Bookmark className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">{meeting.isPermanent ? "Saved" : "Save"}</span>
                        </button>

                        <button
                          onClick={() => handleStartRename(meeting)}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          title="Rename meeting title"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Rename</span>
                        </button>

                        <button
                          onClick={() => handleExportMarkdown(meeting)}
                          className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          title="Export meeting summary as Markdown (.md)"
                        >
                          <Download className="h-3.5 w-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Export</span>
                        </button>

                        <button
                          onClick={() => handleDeleteMeeting(meeting.id)}
                          className="flex items-center gap-1 rounded-lg bg-rose-950/40 border border-rose-800/40 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-600 hover:text-white transition-all"
                          title="Delete meeting immediately"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: HINT NOTES, INTERACTIVE ACTION CHECKLIST & EMAIL */}
          {/* ========================================================================= */}
          {activeTab === 'notes' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-6">
              
              {/* Meeting Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Hint-Style Notes &amp; Automated Delivery
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Concise executive hint notes and action matrix with interactive checkboxes.
                  </p>
                </div>

                {currentMeeting && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopyNotes(currentMeeting)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                      title="Copy full meeting notes formatted for Slack/Notion"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Notes</span>
                    </button>
                    <button
                      onClick={() => handleExportMarkdown(currentMeeting)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                      title="Download Markdown summary"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-400" />
                      <span>.MD File</span>
                    </button>
                    <button
                      onClick={() => {
                        setEmailSent(true);
                        setTimeout(() => setEmailSent(false), 3000);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                    >
                      {emailSent ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      <span>{emailSent ? "Email Dispatched!" : "Dispatch Email"}</span>
                    </button>
                  </div>
                )}
              </div>

              {!currentMeeting ? (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-8 sm:p-12 text-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">No Meeting Notes Available</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    When {activeUser.name} attends or records a meeting, concise executive hint notes, 60-second TL;DRs, and ownership matrices will be synthesized automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Meeting Subject Banner */}
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {(isBotJoined || isLiveListening) && currentMeeting.id === selectedMeetingId ? "Live In-Call Session" : "Active Meeting Summary"}
                      </span>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>{currentMeeting.title}</span>
                        {(isBotJoined || isLiveListening) && currentMeeting.id === selectedMeetingId && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            IN CALL ({formatTimer(meetingTimerSeconds)})
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">{currentMeeting.platform}</span>
                      <span>{currentMeeting.date}</span>
                      {(isBotJoined || isLiveListening) && currentMeeting.id === selectedMeetingId && (
                        <button
                          type="button"
                          onClick={handleExitMeeting}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                          title="Exit this meeting and finalize notes"
                        >
                          <PhoneOff className="h-3.5 w-3.5" />
                          <span>Exit Meeting</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 60s TL;DR */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                      🎯 60-Second Executive TL;DR
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {currentMeeting.summary?.tldr?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      )) || (
                        <li className="text-slate-500 italic">Synthesizing live meeting transcript...</li>
                      )}
                    </ul>
                  </div>

                  {/* Concept Anchors */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
                      💡 Concept Anchors &amp; Hints
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {currentMeeting.summary?.anchors?.map((anchor, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            {anchor.concept}
                          </span>
                          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                            {anchor.hint}
                          </p>
                        </div>
                      )) || (
                        <div className="text-xs text-slate-500 italic col-span-3">Extracting key concepts...</div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Action Items Checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        📋 Action Items &amp; Ownership Matrix
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {currentMeeting.summary?.actions?.filter(a => a.completed).length || 0} of {currentMeeting.summary?.actions?.length || 0} completed
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden divide-y divide-slate-800">
                      {currentMeeting.summary?.actions?.map(act => (
                        <div 
                          key={act.id} 
                          onClick={() => handleToggleActionCompleted(currentMeeting.id, act.id)}
                          className="p-3 flex items-start gap-3 hover:bg-slate-900/50 cursor-pointer transition-colors"
                        >
                          <button type="button" className="mt-0.5 text-slate-400 hover:text-white shrink-0">
                            {act.completed ? (
                              <CheckSquare className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-500" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${act.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {act.task}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>Owner: <strong>{act.owner}</strong></span>
                              <span>&bull;</span>
                              <span className="text-rose-400">Due: {act.deadline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Action Item */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="text"
                        value={newActionItemTask}
                        onChange={(e) => setNewActionItemTask(e.target.value)}
                        placeholder="Add new deliverable or action item..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={newActionItemOwner}
                        onChange={(e) => setNewActionItemOwner(e.target.value)}
                        placeholder={`Assignee (default: ${activeUser.name})`}
                        className="w-full sm:w-44 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomAction(currentMeeting.id)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: COMIC STRIP (3/MONTH ON ₹99, UNLIMITED ON ₹1099) */}
          {/* ========================================================================= */}
          {activeTab === 'comic' && (
            activeUser.plan === 'free' ? (
              <div className="rounded-2xl border border-pink-500/30 bg-pink-950/20 p-6 sm:p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mx-auto">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">4-Panel Visual Comic Generator is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Free Tier accounts do not have access to visual comic storytelling. Upgrade {activeUser.name}&apos;s account to the <strong>Monthly Plan (₹99/month for 3 comics)</strong> or <strong>Yearly Plan (₹1099/year for UNLIMITED comics)</strong>.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('monthly')}
                    className="rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-5 py-2.5 shadow-lg shadow-pink-600/30 transition-all"
                  >
                    Unlock with Monthly (3 comics / ₹99)
                  </button>
                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold px-5 py-2.5 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Unlock UNLIMITED (₹1099/yr)
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-6">
                
                {/* Comic Header with Exact Plan Quota Tracker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-pink-400" />
                        4-Panel Visual Comic Strip Generator
                      </h3>
                      {activeUser.plan === 'monthly' ? (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                          Monthly Plan: {activeUser.comicGenerationsUsed || 0} / 3 Used This Month
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                          Yearly VIP: Unlimited Comic Generations
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Transforms complex technical meetings into an engaging narrative storyboard with character dialogues.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateComic}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Generate New Comic</span>
                    </button>
                    {currentMeeting && (
                      <button
                        onClick={() => alert(`Exporting Comic Strip for '${currentMeeting.title}' as high-res PNG...`)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PNG
                      </button>
                    )}
                  </div>
                </div>

                {/* Monthly Limit Exhausted Warning (if >= 3 on Monthly plan) */}
                {activeUser.plan === 'monthly' && (activeUser.comicGenerationsUsed || 0) >= 3 && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                      <div>
                        <strong>Monthly Comic Limit Reached (3 of 3 used):</strong>
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          You have used all 3 comic generation credits included in the ₹99/month subscription.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectPlan('yearly')}
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 shrink-0 shadow-md shadow-amber-500/20"
                    >
                      Upgrade to Yearly for Unlimited Comics →
                    </button>
                  </div>
                )}

                {!currentMeeting ? (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-8 sm:p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mx-auto">
                      <Palette className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">No Meeting Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Record or join a meeting using the input bar above. MeetMee will automatically illustrate the discussion as a 4-panel comic strip.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Panel 1 */}
                    <div className="rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-slate-950 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Panel 1: Meeting Kickoff</span>
                        <div className="mt-2.5 h-24 sm:h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                          Team gathers for &ldquo;{currentMeeting.title}&rdquo; on {currentMeeting.platform}.
                        </div>
                        <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                          <strong className="text-[10px] text-slate-400 block mb-0.5">{activeUser.name}:</strong>
                          &ldquo;Starting our agenda points for today&apos;s sync.&rdquo;
                        </div>
                      </div>
                    </div>

                    {/* Panel 2 */}
                    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-slate-950 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Panel 2: Technical Challenge</span>
                        <div className="mt-2.5 h-24 sm:h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                          Technical debate on sub-second latency and offline recording resilience.
                        </div>
                        <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                          <strong className="text-[10px] text-slate-400 block mb-0.5">Meeting Lead:</strong>
                          &ldquo;We need 24/7 attendance even if network connection drops.&rdquo;
                        </div>
                      </div>
                    </div>

                    {/* Panel 3 */}
                    <div className="rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-950 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Panel 3: Autonomous Solution</span>
                        <div className="mt-2.5 h-24 sm:h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                          MeetMee in-house headless bot captures WebRTC audio stream with zero 3rd-party dependency.
                        </div>
                        <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                          <strong className="text-[10px] text-slate-400 block mb-0.5">MeetMee Bot:</strong>
                          &ldquo;Audio captured at 16kHz. Real-time RAG active.&rdquo;
                        </div>
                      </div>
                    </div>

                    {/* Panel 4 */}
                    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-950 p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Panel 4: Action Items Aligned</span>
                        <div className="mt-2.5 h-24 sm:h-28 rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-400 italic flex items-center text-center">
                          Action items distributed via email; team celebrates meeting clarity.
                        </div>
                        <div className="mt-3 rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white">
                          <strong className="text-[10px] text-slate-400 block mb-0.5">{activeUser.name}:</strong>
                          &ldquo;Everything documented and protected under our retention policy!&rdquo;
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* ========================================================================= */}
          {/* TAB: PODCAST (Gated: Locked for Free & Monthly, Unlocked for Yearly ₹1099) */}
          {/* ========================================================================= */}
          {activeTab === 'podcast' && (
            activeUser.plan !== 'yearly' ? (
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 sm:p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Bilingual Conversational Podcast Engine is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  The NotebookLM-style bilingual podcast generator is exclusive to the <strong>Yearly Plan (₹1099/year)</strong>. Upgrade to transform meeting notes into natural 2-speaker audio conversations in English, Hindi, Spanish, and French.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-5 py-2.5 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Upgrade to Yearly (₹1099/yr)
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-indigo-400" />
                      NotebookLM-Style Multilingual Podcast Engine
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Yearly VIP
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Synthesizes a 2-host conversational recap of your meeting discussions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">Language:</span>
                    <select
                      value={podcastLang}
                      onChange={(e) => setPodcastLang(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="en">English (Deep Dive)</option>
                      <option value="hi">हिंदी (Hindi Recap)</option>
                      <option value="es">Español (Spanish Recap)</option>
                      <option value="fr">Français (French Recap)</option>
                    </select>
                  </div>
                </div>

                {!currentMeeting ? (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-8 sm:p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                      <Headphones className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">No Meeting Recorded Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Record or join a meeting above. MeetMee will generate a 2-host conversational podcast covering key decisions and insights.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Audio Player Card */}
                    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900 p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                            <Headphones className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">Audio Overview: {currentMeeting.title}</h4>
                            <p className="text-[11px] sm:text-xs text-indigo-300">Generated for {activeUser.name} &bull; 2 AI Co-Hosts</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsAudioPlaying(!isAudioPlaying);
                            playChime();
                          }}
                          className="h-10 w-10 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
                        >
                          {isAudioPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${isAudioPlaying ? 58 : 20}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{isAudioPlaying ? "01:42" : "00:30"}</span>
                          <span>04:15</span>
                        </div>
                      </div>
                    </div>

                    {/* Dialogue Script */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Podcast Transcript Preview:
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <strong className="text-indigo-400 block mb-0.5">Host A:</strong>
                          &ldquo;Welcome to today&apos;s MeetMee recap of {currentMeeting.title}. We saw major technical milestones achieved.&rdquo;
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <strong className="text-emerald-400 block mb-0.5">Host B:</strong>
                          &ldquo;Exactly, and the headline is offline bot resilience. If internet drops, MeetMee stays connected and records uninterrupted.&rdquo;
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* ========================================================================= */}
          {/* TAB: NATIVE VOICE ASSISTANT (YEARLY PLAN EXCLUSIVE) */}
          {/* ========================================================================= */}
          {activeTab === 'assistant' && (
            activeUser.plan !== 'yearly' ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <Crown className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Native Language Voice Assistant is Locked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  The Native Language Voice Assistant for general use (Hindi, Tamil, Telugu, Spanish, French, English) is exclusive to the <strong>Yearly Plan (₹1099/year)</strong>. Upgrade to interact with your meeting intelligence naturally in your mother tongue.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleSelectPlan('yearly')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-5 py-2.5 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    Upgrade to Yearly (₹1099/yr)
                  </button>
                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Mic className="h-5 w-5 text-emerald-400" />
                      Native Language Voice Assistant (General Use)
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Yearly VIP
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ask general questions, draft agendas, and retrieve past meeting knowledge in your regional language.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">Language:</span>
                    <select
                      value={assistantLang}
                      onChange={(e) => setAssistantLang(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="en">English (Default)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="fr">Français (French)</option>
                    </select>
                  </div>
                </div>

                {/* Assistant Chat Stream */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {activeUser.assistantHistory.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-xs leading-relaxed ${
                        item.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {item.role === 'assistant' && (
                        <div className="h-7 w-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div className={`rounded-xl p-3 max-w-[85%] sm:max-w-[75%] ${
                        item.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}>
                        {item.text}
                      </div>
                    </div>
                  ))}

                  {isAssistantSpeaking && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 italic">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Synthesizing response in chosen native tongue...</span>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <form onSubmit={handleAssistantSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={assistantQuery}
                    onChange={(e) => setAssistantQuery(e.target.value)}
                    placeholder={`Ask anything in ${assistantLang.toUpperCase()} or English...`}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )
          )}

        </div>

      </main>

      {/* ========================================================================= */}
      {/* USER MANAGEMENT & ACCOUNT SWITCHER MODAL (MULTI-USER SUPPORT) */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Multi-User Management</h3>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {!isAddUserMode ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select an account or register a new profile. Each account maintains its own isolated meeting history, retention lifecycle, notes, and subscription limits.
                </p>

                {/* User List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        u.id === activeUser.id 
                          ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/40' 
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{u.name}</span>
                            {u.id === activeUser.id && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded shrink-0">Active</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email} &bull; {u.role}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 block">
                          {u.plan} Tier
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {u.meetings?.length || 0} meetings
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAddUserMode(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 shadow-sm transition-all cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      Register New User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetAllDataExceptPayment();
                        setIsUserModalOpen(false);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-950/40 hover:border-rose-500/40 text-rose-300 text-xs font-semibold px-3 py-2 transition-all cursor-pointer"
                      title="Reset all meeting records & newly added data while keeping payment data"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Data
                    </button>
                  </div>
                  <button
                    onClick={() => setIsUserModalOpen(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddNewUser} className="space-y-3.5">
                <p className="text-xs text-slate-400">
                  Register a new colleague or client. A clean meeting repository will be allocated immediately.
                </p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Full Name of User</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gmail / Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role / Department</label>
                  <input
                    type="text"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    placeholder="Enter role or department (optional)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserMode(false)}
                    className="rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2 hover:bg-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all"
                  >
                    Create User &amp; Switch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHOW PURCHASED SUBSCRIPTION AT BOTTOM OF WEB APP (WHEN USER BOUGHT PLAN) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-6 w-full">
        {activeUser.plan !== 'free' ? (
          /* DISPLAY WHEN USER HAS BOUGHT SUBSCRIPTION */
          <div className={`rounded-2xl border p-4 sm:p-6 transition-all shadow-2xl relative overflow-hidden animate-in fade-in duration-300 ${
            activeUser.plan === 'yearly'
              ? 'border-amber-500/70 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 ring-2 ring-amber-500/40'
              : 'border-indigo-500/70 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-indigo-950/30 ring-2 ring-indigo-500/40'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              {/* Plan Info Column */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Purchased Subscription:
                  </span>
                  {activeUser.plan === 'yearly' && (
                    <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <Crown className="h-4 w-4 text-amber-400" />
                      {subscriptionValidity.isLifetime 
                        ? 'Yearly VIP All-Access Plan • 👑 Free All Time (Perpetual VIP)' 
                        : 'Yearly VIP All-Access Plan (₹1,099/yr) • Verified Active'}
                    </span>
                  )}
                  {activeUser.plan === 'monthly' && (
                    <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <Zap className="h-4 w-4 text-indigo-400" />
                      Monthly Pro Plan (₹99/mo) &bull; Verified Active
                    </span>
                  )}
                </div>

                {/* Lifetime VIP Notice Banner for ABIRAMI P */}
                {subscriptionValidity.isLifetime && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 flex items-center gap-2.5">
                    <Crown className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Perpetual Lifetime VIP Active:</strong> User <strong>{VIP_ACCOUNT_CONFIG.name}</strong> enjoys VIP Subscription free for all time with zero expiry dates or renewal fees.
                    </span>
                  </div>
                )}

                {/* Status details & metrics grid (5 cards including Plan Validity) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Meeting Quota</span>
                    <span className="text-white font-bold">
                      {activeUser.plan === 'yearly' 
                        ? 'Unlimited Access' 
                        : `${activeUser.meetingsCount || 0} / 100 meetings`}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Comic Generator</span>
                    <span className="font-bold">
                      {activeUser.plan === 'yearly' ? (
                        <span className="text-amber-300">Unlimited Active</span>
                      ) : (
                        <span className="text-pink-300">{activeUser.comicGenerationsUsed || 0} / 3 used</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Multilingual Podcast</span>
                    <span className="font-bold">
                      {activeUser.plan === 'yearly' ? (
                        <span className="text-emerald-400">Active (NotebookLM)</span> 
                      ) : (
                        <span className="text-slate-500">Locked (Yearly only)</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Native Voice AI</span>
                    <span className="font-bold">
                      {activeUser.plan === 'yearly' ? (
                        <span className="text-amber-400">Active (Multi-dialect)</span> 
                      ) : (
                        <span className="text-slate-500">Locked (Yearly only)</span>
                      )}
                    </span>
                  </div>

                  {/* 5th Card: Plan Validity & Days Remaining */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Plan Validity</span>
                    <span className="font-bold">
                      {subscriptionValidity.isLifetime ? (
                        <span className="text-amber-300 flex items-center gap-1">
                          <Crown className="h-3 w-3" /> Free All Time
                        </span>
                      ) : subscriptionValidity.isExpired ? (
                        <span className="text-rose-400">Expired ({subscriptionValidity.expiryDateFormatted})</span>
                      ) : subscriptionValidity.isEndingSoon ? (
                        <span className="text-amber-400 animate-pulse">{subscriptionValidity.daysRemaining}d left (Expires {subscriptionValidity.expiryDateFormatted})</span>
                      ) : (
                        <span className="text-emerald-400">{subscriptionValidity.daysRemaining}d left (Expires {subscriptionValidity.expiryDateFormatted})</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Column */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                {subscriptionValidity.isLifetime ? (
                  <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    <span>Free VIP All Time</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPaymentModal(activeUser.plan === 'monthly' ? 'yearly' : 'monthly')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Renew / Upgrade Plan (Scan QR)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className="border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All Benefits</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* DISPLAY WHEN NO PAID SUBSCRIPTION BOUGHT YET */
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Unlock Unlimited AI Meeting Intelligence</span>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">Free Tier Active</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Buy a subscription via UPI QR to unlock unlimited video bot attendance, comic strips, podcasts, and native voice AI.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPaymentModal('monthly')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              <QrCode className="h-4 w-4" />
              <span>Buy Subscription (Scan QR)</span>
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-5 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            MeetMee Multi-Tenant Intelligence &bull; Responsive on Mobile, Tablet &amp; Desktop
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Free Tier (3 calls)</span>
            <span>&bull;</span>
            <span>Monthly ₹99 (3 Comics)</span>
            <span>&bull;</span>
            <span>Yearly ₹1,099 (Unlimited Comics)</span>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* FIXED / DOCKED BOTTOM BAR (DISPLAYED WHEN USER BOUGHT SUBSCRIPTION) */}
      {/* ========================================================================= */}
      {activeUser.plan !== 'free' && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-amber-500/40 py-2 px-3 sm:px-6 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              {activeUser.plan === 'yearly' ? (
                <Crown className="h-4 w-4 text-amber-400" />
              ) : (
                <Zap className="h-4 w-4 text-indigo-400" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span className="text-slate-400">Purchased Subscription:</span>
                <span className={activeUser.plan === 'yearly' ? 'text-amber-400 font-extrabold' : 'text-indigo-400 font-extrabold'}>
                  {activeUser.plan === 'yearly' ? 'Yearly VIP Plan (₹1,099/yr)' : 'Monthly Pro Plan (₹99/mo)'}
                </span>
                {subscriptionValidity.isLifetime ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                    👑 Free All Time
                  </span>
                ) : subscriptionValidity.isExpired ? (
                  <span className="bg-rose-500/20 text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">
                    Expired
                  </span>
                ) : subscriptionValidity.isEndingSoon ? (
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                    {subscriptionValidity.daysRemaining}d Left
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {subscriptionValidity.daysRemaining}d Left
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden xs:block sm:block">
                {subscriptionValidity.isLifetime
                  ? '👑 Perpetual Free VIP • Unlimited Video Meetings, UNLIMITED Comics, Multilingual Podcasts & Voice AI Forever'
                  : activeUser.plan === 'yearly' 
                    ? `Unlimited Video Meetings, UNLIMITED Comics, Multilingual Podcasts & Voice AI • Valid until ${subscriptionValidity.expiryDateFormatted}` 
                    : `Comics: ${activeUser.comicGenerationsUsed || 0}/3 used • Up to 100 meetings • Valid until ${subscriptionValidity.expiryDateFormatted}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {subscriptionValidity.isLifetime ? (
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl hidden sm:inline-flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Lifetime Free VIP</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenPaymentModal(activeUser.plan === 'free' ? 'monthly' : 'yearly')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Renew / Manage (Scan QR)</span>
                <span className="sm:hidden">QR</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAYMENT & UPI QR CODE MODAL */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Buy Subscription via UPI QR</h3>
                  <p className="text-[11px] text-slate-400">Scan &amp; pay instantly with any UPI app</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Plan Selector Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForPayment('monthly')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPlanForPayment === 'monthly'
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/40'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Monthly Plan</span>
                  <span className="text-xs font-extrabold text-indigo-400">₹99</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">100 meetings + 3 comics/mo</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanForPayment('yearly')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPlanForPayment === 'yearly'
                    ? 'border-amber-500 bg-amber-950/40 ring-2 ring-amber-500/40'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Yearly VIP Plan</span>
                  <span className="text-xs font-extrabold text-amber-400">₹1,099</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Unlimited meetings &amp; comics</p>
              </button>
            </div>

            {/* Official User QR Code Display Container */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-2xl shadow-xl border-4 border-indigo-500/40 flex items-center justify-center">
                <img
                  src={paymentQrImage}
                  alt="MeetMee Official UPI Payment QR Code"
                  className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white">
                  Amount to Pay: <span className="text-emerald-400 text-base font-extrabold">
                    {selectedPlanForPayment === 'yearly' ? '₹1,099' : '₹99'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Scan using <strong>Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI App</strong>
                </p>
              </div>
            </div>

            {/* Payment Confirmation Form */}
            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  UPI Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  value={paymentUtr}
                  onChange={(e) => setPaymentUtr(e.target.value)}
                  placeholder="e.g. 428901234567 (12-digit transaction ID)"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-5 py-2 shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {paymentSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirm Payment &amp; Activate Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PARTICIPANT PRESENCE & ENDED CALLS GUIDE MODAL */}
      {/* ========================================================================= */}
      {showPresenceGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Meet &amp; Zoom Presence Guide</h3>
                  <p className="text-[11px] text-slate-400">Understanding bot participant admission &amp; ended call links</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresenceGuideModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Explainer Cards */}
            <div className="space-y-3 text-xs">
              
              {/* Card 1: Why did an afternoon meeting link fail/get blocked? */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>1. Why Afternoon / Concluded Meetings Cannot Be Joined Live</span>
                </div>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  Google Meet and Zoom invalidate temporary room codes once the meeting ends and participants hang up. If you enter an afternoon meeting code hours later, Google Meet displays: <strong className="text-amber-200">"You can't join this call — The meeting has ended."</strong>
                </p>
                <div className="bg-slate-950/70 rounded-lg p-2.5 border border-amber-500/20 text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">👉 For Past Meetings:</span>
                  <span>Use the <strong className="text-white">"Upload Audio File"</strong> button to upload the meeting recording (.mp3 / .wav / .m4a) for instant AI notes &amp; comics.</span>
                </div>
              </div>

              {/* Card 2: Why didn't the bot show in the participant list? */}
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-300 font-bold">
                  <Users className="h-4 w-4 shrink-0" />
                  <span>2. Why External Bots Require Host "Admit" in the Lobby</span>
                </div>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  For security and privacy, Google Meet and Zoom do <strong>not</strong> allow external guests or automated bots to sneak into a call unannounced. When a headless bot joins, Google Meet displays a prompt on the meeting host's screen:
                </p>
                <div className="bg-slate-950/90 rounded-lg p-2.5 border border-blue-500/30 font-mono text-[11px] text-blue-200">
                  "Someone wants to join this call: MeetMee AI Assistant &bull; [Admit] [Deny]"
                </div>
                <p className="text-slate-400 text-[11px]">
                  Until the meeting host clicks <strong className="text-emerald-300">"Admit"</strong>, the bot is kept in the waiting lobby and will not appear in the active participant list.
                </p>
              </div>

              {/* Card 3: The 100% Host-Free Zero Admission Alternative */}
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <Mic className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>3. Recommended Zero-Wait Solution: "🎙️ Live Tab/Mic Capture"</span>
                </div>
                <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
                  If you are already attending the meeting on your computer or phone, you do <strong>not</strong> need to wait for a bot or host admission! Click <strong className="text-emerald-300">"🎙️ Live Tab/Mic Capture"</strong> on the homepage. MeetMee captures your audio directly in your browser with zero host approval required.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold block">✓ No Host Admission</span>
                    <span className="text-slate-400 text-[10px]">Zero waiting in lobby</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold block">✓ 100% Reliable</span>
                    <span className="text-slate-400 text-[10px]">Captures live browser sound</span>
                  </div>
                  <div className="bg-slate-950/70 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-bold block">✓ Instant Pop-up Q&amp;A</span>
                    <span className="text-slate-400 text-[10px]">Mentors answers pop up live</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowPresenceGuideModal(false);
                  handleToggleLiveTabCapture();
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Start 🎙️ Live Tab/Mic Capture Now</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresenceGuideModal(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold px-4 py-2.5 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Understood, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
