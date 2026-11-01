"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Bell, Volume2, VolumeX, Users, Trophy, IndianRupee, 
  CheckCircle2, XCircle, Clock, Search, Copy, Check, ExternalLink, 
  Settings, Key, Download, RefreshCw, LogOut, MessageSquare, AlertCircle, Eye, X
} from "lucide-react";
import { TournamentConfig, TeamRegistration, AdminNotification, Player } from "@/lib/types";
import { soundManager } from "@/lib/sound";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio & Notification state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const previousNotifCount = useRef<number>(0);

  // Table filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Modal inspection state
  const [selectedTeam, setSelectedTeam] = useState<TeamRegistration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Room Credentials Quick Update
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomPassInput, setRoomPassInput] = useState("");
  const [roomAnnounced, setRoomAnnounced] = useState(false);
  const [roomUpdating, setRoomUpdating] = useState(false);

  // Quick Price & Tournament Settings Update
  const [quickEntryFee, setQuickEntryFee] = useState<string>("50");
  const [quickFirstPrize, setQuickFirstPrize] = useState<string>("1000");
  const [quickSecondPrize, setQuickSecondPrize] = useState<string>("500");
  const [quickMaxSlots, setQuickMaxSlots] = useState<string>("48");
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceSuccessMsg, setPriceSuccessMsg] = useState("");
  const [priceErrorMsg, setPriceErrorMsg] = useState("");

  const handlePriceNumericInput = (val: string, setter: (v: string) => void) => {
    if (val === "") {
      setter("");
      return;
    }
    const digitsOnly = val.replace(/\D/g, "");
    if (digitsOnly === "") {
      setter("");
      return;
    }
    const cleaned = digitsOnly.replace(/^0+(?=\d)/, "");
    setter(cleaned);
  };

  // Copied states
  const [copiedUids, setCopiedUids] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    const key = localStorage.getItem("patelesp_admin_key");
    if (!key) {
      router.push("/admin/login");
    } else {
      setAdminKey(key);
    }
  }, [router]);

  // Load all data
  const loadDashboardData = async (key: string) => {
    try {
      const [tournRes, teamsRes, notifRes] = await Promise.all([
        fetch("/api/tournament"),
        fetch("/api/teams"),
        fetch("/api/notifications", {
          headers: { "x-admin-key": key },
        }),
      ]);

      const tournData = await tournRes.json();
      const teamsData = await teamsRes.json();
      const notifData = await notifRes.json();

      if (tournData.success && tournData.tournament) {
        const t = tournData.tournament;
        setTournament(t);
        setRoomIdInput(t.roomId || "");
        setRoomPassInput(t.roomPassword || "");
        setRoomAnnounced(t.roomAnnounced || false);
        setQuickEntryFee(String(t.entryFee ?? 50));
        setQuickFirstPrize(String(t.firstPrize ?? 1000));
        setQuickSecondPrize(String(t.secondPrize ?? 500));
        setQuickMaxSlots(String(t.maxSlots ?? 48));
      }

      if (teamsData.success) {
        setTeams(teamsData.teams);
      }

      if (notifData.success) {
        setNotifications(notifData.notifications);
        const unread = notifData.unreadCount || 0;

        // Check if there are brand new notifications to play sound
        if (unread > previousNotifCount.current && soundEnabled && previousNotifCount.current !== 0) {
          soundManager.playNewRegistrationSound();
        }
        previousNotifCount.current = unread;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminKey) return;
    loadDashboardData(adminKey);

    // Real-time polling every 8 seconds for instant live notifications
    const interval = setInterval(() => {
      loadDashboardData(adminKey);
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, soundEnabled]);

  const handleStatusChange = async (teamId: string, status: "approved" | "rejected") => {
    if (!adminKey) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ id: teamId, status }),
      });

      const data = await res.json();
      if (data.success) {
        if (status === "approved") {
          soundManager.playSuccessSound();
        }
        await loadDashboardData(adminKey);
        if (selectedTeam && selectedTeam.id === teamId) {
          setSelectedTeam(data.team);
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return;
    setRoomUpdating(true);

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          roomId: roomIdInput.trim(),
          roomPassword: roomPassInput.trim(),
          roomAnnounced,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTournament(data.tournament);
        soundManager.playSuccessSound();
        alert("Free Fire Custom Room Details Broadcasted Successfully!");
      }
    } catch (err) {
      alert("Failed to update room credentials");
    } finally {
      setRoomUpdating(false);
    }
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return;
    setPriceSaving(true);
    setPriceSuccessMsg("");
    setPriceErrorMsg("");

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          entryFee: Number(quickEntryFee) || 0,
          firstPrize: Number(quickFirstPrize) || 0,
          secondPrize: Number(quickSecondPrize) || 0,
          maxSlots: Number(quickMaxSlots) || 48,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTournament(data.tournament);
        soundManager.playSuccessSound();
        setPriceSuccessMsg("Price & Prize Pool updated successfully across entire website!");
        setTimeout(() => setPriceSuccessMsg(""), 5000);
      } else {
        setPriceErrorMsg(data.message || "Failed to update pricing");
      }
    } catch (err) {
      setPriceErrorMsg("Error saving tournament prices to database");
    } finally {
      setPriceSaving(false);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!adminKey) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const copyTeamUids = (team: TeamRegistration) => {
    const uids = team.players.map((p) => `${p.name}: ${p.freeFireUid}`).join("\n");
    navigator.clipboard.writeText(uids);
    setCopiedUids(team.id);
    setTimeout(() => setCopiedUids(null), 2000);
  };

  const exportCsv = () => {
    const headers = "Team ID,Team Name,Captain Phone,Status,UTR Reference,Player 1 UID,Player 2 UID,Player 3 UID,Player 4 UID\n";
    const rows = teams
      .map(
        (t) =>
          `"${t.id}","${t.teamName}","${t.captainPhone}","${t.status}","${t.utrNumber}","${t.players[0]?.freeFireUid || ""}","${t.players[1]?.freeFireUid || ""}","${t.players[2]?.freeFireUid || ""}","${t.players[3]?.freeFireUid || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `patelesp-teams-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("patelesp_admin_key");
    router.push("/admin/login");
  };

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesQuery =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captainPhone.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.players.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.freeFireUid.includes(searchQuery));
    return matchesStatus && matchesQuery;
  });

  const approvedTeamsCount = teams.filter((t) => t.status === "approved").length;
  const pendingTeamsCount = teams.filter((t) => t.status === "pending").length;
  const totalRevenue = teams
    .filter((t) => t.status === "approved")
    .reduce((sum, t) => sum + (t.entryFeePaid || 50), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">Opening PATELESP Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100">
      {/* Admin Top Bar */}
      <header className="border-b border-dark-800 bg-dark-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyber-500/20 text-cyber-400 border border-cyber-500/40 flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base sm:text-lg tracking-wider">PATEL<span className="text-cyber-400">ESP</span></span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyber-500/10 text-cyber-400 border border-cyber-500/30 uppercase">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Created by <strong className="text-cyber-400 font-semibold">Juned Patel</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundManager.playSuccessSound();
              }}
              title={soundEnabled ? "Live Sound Alert Active" : "Sound Muted"}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-dark-800 text-gray-400 border-dark-750"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? "Sound Alert ON" : "Muted"}</span>
            </button>

            {/* Test Audio Button */}
            <button
              onClick={() => soundManager.playNewRegistrationSound()}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg bg-dark-800 text-gray-300 hover:text-white border border-dark-750 text-[11px] font-semibold"
              title="Test New Team Sound Ping"
            >
              Test Ping
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (unreadCount > 0) markAllNotificationsRead();
                }}
                className="relative p-2 rounded-xl bg-dark-800 border border-dark-750 text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-fire-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-glow-fire">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-dark-900 border border-dark-750 shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-dark-800">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-fire-400" /> Team Notifications
                    </h4>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-gray-400 hover:text-white font-semibold"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className="p-3 rounded-xl bg-dark-950 border border-dark-800 flex items-start justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{n.teamName}</p>
                            <p className="text-[11px] text-gray-400">WhatsApp: {n.captainPhone}</p>
                            <p className="text-[10px] text-fire-400 font-mono">UTR: {n.utrNumber}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings link */}
            <Link
              href="/admin/settings"
              className="p-2 rounded-xl bg-dark-800 border border-dark-750 text-gray-300 hover:text-white"
              title="Tournament Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-dark-800 border border-dark-750 text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="gaming-card rounded-2xl p-5 border-dark-750">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Squads</span>
              <Users className="w-5 h-5 text-cyber-400" />
            </div>
            <div className="text-3xl font-black text-white">{teams.length}</div>
            <p className="text-[11px] text-gray-400 mt-1">{tournament?.maxSlots || 48} Max Capacity</p>
          </div>

          <div className="gaming-card rounded-2xl p-5 border-green-500/30">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase">Slots Approved</span>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-black text-green-400">{approvedTeamsCount}</div>
            <p className="text-[11px] text-gray-400 mt-1">Confirmed Free Fire Slots</p>
          </div>

          <div className="gaming-card rounded-2xl p-5 border-amber-500/30">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase">Pending Review</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{pendingTeamsCount}</div>
            <p className="text-[11px] text-gray-400 mt-1">Awaiting UTR Payment Check</p>
          </div>

          <div className="gaming-card rounded-2xl p-5 border-fire-500/30">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Collections</span>
              <IndianRupee className="w-5 h-5 text-fire-400" />
            </div>
            <div className="text-3xl font-black text-white">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-[11px] text-gray-400 mt-1">Entry Fee Pool (₹{tournament?.entryFee ?? 50} / team)</p>
          </div>
        </div>

        {/* QUICK TOURNAMENT PRICE & SETTINGS (INSTANT WEBSITE CONTROL) */}
        <div className="gaming-card-cyber rounded-2xl p-5 sm:p-6 border-cyber-500/30 bg-dark-900/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-dark-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyber-500/20 text-cyber-400 flex items-center justify-center border border-cyber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Quick Tournament Pricing & Rewards
                </h3>
                <p className="text-xs text-gray-400">
                  Update squad entry fee and prize pool here — changes apply instantly across the whole website!
                </p>
              </div>
            </div>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyber-400 hover:text-white px-3 py-1.5 rounded-lg bg-cyber-500/10 border border-cyber-500/30 transition-colors w-fit"
            >
              <Settings className="w-3.5 h-3.5" /> Full Settings
            </Link>
          </div>

          {priceSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{priceSuccessMsg}</span>
            </div>
          )}

          {priceErrorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{priceErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePrices} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Entry Fee */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-fire-500 transition-colors">
                <label className="block text-[11px] font-black uppercase text-fire-400 mb-1">
                  Entry Fee (₹ Squad)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-sm font-bold text-gray-500">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="50"
                    value={quickEntryFee}
                    onChange={(e) => handlePriceNumericInput(e.target.value, setQuickEntryFee)}
                    className="w-full bg-transparent pl-6 pr-2 py-1 text-white font-black text-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* 1st Prize */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-gold-500 transition-colors">
                <label className="block text-[11px] font-black uppercase text-gold-400 mb-1">
                  1st Prize (₹ Champion)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-sm font-bold text-gray-500">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="1000"
                    value={quickFirstPrize}
                    onChange={(e) => handlePriceNumericInput(e.target.value, setQuickFirstPrize)}
                    className="w-full bg-transparent pl-6 pr-2 py-1 text-gold-400 font-black text-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* 2nd Prize */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-cyber-500 transition-colors">
                <label className="block text-[11px] font-black uppercase text-cyber-400 mb-1">
                  2nd Prize (₹ Runner-Up)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-sm font-bold text-gray-500">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="500"
                    value={quickSecondPrize}
                    onChange={(e) => handlePriceNumericInput(e.target.value, setQuickSecondPrize)}
                    className="w-full bg-transparent pl-6 pr-2 py-1 text-cyber-400 font-black text-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Max Slots */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-cyber-500 transition-colors">
                <label className="block text-[11px] font-black uppercase text-gray-300 mb-1">
                  Max Slots
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="48"
                    value={quickMaxSlots}
                    onChange={(e) => handlePriceNumericInput(e.target.value, setQuickMaxSlots)}
                    className="w-full bg-transparent px-2 py-1 text-white font-black text-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-gray-400">
                Total Prize Pool: <strong className="text-white">₹{((Number(quickFirstPrize) || 0) + (Number(quickSecondPrize) || 0)).toLocaleString()}</strong>
              </div>
              <button
                type="submit"
                disabled={priceSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyber-gradient text-dark-950 text-xs font-black uppercase tracking-wider shadow-glow-cyber hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {priceSaving ? "Saving..." : "Save & Update Website Price"}
              </button>
            </div>
          </form>
        </div>

        {/* CUSTOM ROOM ID & PASSWORD BROADCASTER */}
        <div className="gaming-card rounded-2xl p-5 sm:p-6 border-fire-500/30 bg-dark-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-fire-500/20 text-fire-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Free Fire Custom Room Credentials</h3>
                <p className="text-xs text-gray-400">
                  Broadcast Room ID & Password to approved teams&apos; ticket pages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roomAnnounced}
                  onChange={(e) => setRoomAnnounced(e.target.checked)}
                  className="w-4 h-4 rounded text-fire-500 focus:ring-0 bg-dark-950 border-dark-750"
                />
                Broadcast Live to Verified Teams
              </label>
            </div>
          </div>

          <form onSubmit={handleUpdateRoom} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Custom Room ID</label>
              <input
                type="text"
                placeholder="e.g. 84920419"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">Room Password</label>
              <input
                type="text"
                placeholder="e.g. 1234"
                value={roomPassInput}
                onChange={(e) => setRoomPassInput(e.target.value)}
                className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={roomUpdating}
                className="w-full py-2.5 px-4 rounded-xl bg-fire-gradient text-white text-xs font-black uppercase tracking-wider shadow-glow-fire hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {roomUpdating ? "Saving..." : "Broadcast Room Credentials"}
              </button>
            </div>
          </form>
        </div>

        {/* REGISTERED PLAYERS TABLE (CLEAN & MOBILE FRIENDLY) */}
        <div className="gaming-card rounded-2xl p-4 sm:p-6 border-dark-750 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-fire-400" />
                Registered Players ({filteredTeams.length})
              </h3>
              <p className="text-xs text-gray-400">Squad players registered for the tournament</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Search input */}
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search team or player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-950 border border-dark-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-fire-500 w-full sm:w-56"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
                className="bg-dark-950 border border-dark-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Export CSV */}
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 text-gray-300 hover:text-white border border-dark-750 text-xs font-semibold"
                title="Download CSV for Match Referee"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Mobile View: Clean Registered Player Cards (No Clutter, 100% Mobile Friendly) */}
          <div className="block sm:hidden space-y-3">
            {filteredTeams.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                No squad registrations match your search filters.
              </div>
            ) : (
              filteredTeams.map((team, idx) => (
                <div key={team.id} className="p-4 rounded-xl bg-dark-900 border border-dark-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-dark-800 text-gray-400 border border-dark-700">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white text-sm">{team.teamName}</span>
                      </div>
                      <span className="text-[11px] font-mono text-fire-400">{team.id}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        team.status === "approved"
                          ? "bg-green-500/10 text-green-400 border border-green-500/30"
                          : team.status === "rejected"
                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>

                  {/* Registered Players Names */}
                  <div className="p-2.5 rounded-lg bg-dark-950 border border-dark-850">
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Registered Players:</p>
                    <p className="text-xs text-gray-200 font-medium leading-relaxed">
                      {team.players.map((p) => p.name).filter(Boolean).join(" • ") || "Players Registered"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://wa.me/91${team.captainPhone}?text=Hello%20${encodeURIComponent(team.teamName)},%20this%20is%20PATELESP%20Tournament%20Admin.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-400 hover:underline font-mono"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> {team.captainPhone}
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedTeam(team)}
                        className="px-2 py-1 rounded-lg bg-dark-800 text-gray-300 text-xs font-semibold"
                      >
                        Inspect
                      </button>
                      {team.status !== "approved" && (
                        <button
                          onClick={() => handleStatusChange(team.id, "approved")}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-green-600/20 text-green-400 border border-green-500/30 text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {team.status !== "rejected" && (
                        <button
                          onClick={() => handleStatusChange(team.id, "rejected")}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Streamlined Registered Players Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-900/90 text-gray-400 uppercase font-bold tracking-wider border-b border-dark-800">
                <tr>
                  <th className="py-3 px-3 w-10">#</th>
                  <th className="py-3 px-4">Squad & Registered Players</th>
                  <th className="py-3 px-4">Captain WhatsApp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-850">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No registrations match your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team, idx) => (
                    <tr key={team.id} className="hover:bg-dark-900/50 transition-colors">
                      {/* # Index */}
                      <td className="py-4 px-3 font-mono text-gray-500 font-bold">
                        #{idx + 1}
                      </td>

                      {/* Squad & Registered Players */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white text-sm">{team.teamName}</div>
                        <div className="text-gray-300 text-xs mt-1">
                          <span className="text-gray-400 text-[11px] font-semibold mr-1.5">Players:</span>
                          {team.players.map((p) => p.name).filter(Boolean).join(" • ")}
                        </div>
                        <div className="text-[10px] font-mono text-fire-400 mt-0.5">{team.id}</div>
                      </td>

                      {/* Captain WhatsApp */}
                      <td className="py-4 px-4">
                        <div className="text-gray-300 font-mono">+91 {team.captainPhone}</div>
                        <a
                          href={`https://wa.me/91${team.captainPhone}?text=Hello%20${encodeURIComponent(team.teamName)},%20this%20is%20PATELESP%20Tournament%20Admin.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-green-400 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            team.status === "approved"
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : team.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {team.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                          {team.status === "rejected" && <XCircle className="w-3 h-3" />}
                          {team.status === "pending" && <Clock className="w-3 h-3" />}
                          {team.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-gray-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>

                        {team.status !== "approved" && (
                          <button
                            onClick={() => handleStatusChange(team.id, "approved")}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}

                        {team.status !== "rejected" && (
                          <button
                            onClick={() => handleStatusChange(team.id, "rejected")}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Footer Attribution */}
        <div className="pt-4 pb-8 text-center text-xs text-gray-400">
          PATELESP Tournament Management Console • Created by <strong className="text-white">Juned Patel</strong>
        </div>
      </main>

      {/* TEAM DETAILS MODAL */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="gaming-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border-fire-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-dark-800">
              <div>
                <span className="text-[10px] font-black uppercase text-fire-400 font-mono tracking-widest">
                  {selectedTeam.id}
                </span>
                <h3 className="text-2xl font-black text-white uppercase">{selectedTeam.teamName}</h3>
                <p className="text-xs text-gray-400">Captain WhatsApp: +91 {selectedTeam.captainPhone}</p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-2 rounded-xl bg-dark-900 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Info */}
            <div className="p-4 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">UPI Payment UTR Reference</p>
                <p className="text-base font-mono font-bold text-white">{selectedTeam.utrNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-gray-400">Entry Fee</p>
                <p className="text-base font-bold text-fire-400">₹{selectedTeam.entryFeePaid}</p>
              </div>
            </div>

            {/* 4 Players Roster Full Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-gray-300 tracking-wider">
                Full 4-Player Roster & Free Fire UIDs
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTeam.players.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-dark-950 border border-dark-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-fire-400">Player #{idx + 1}</span>
                      {idx === 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-fire-500/20 text-fire-400 uppercase">
                          Captain
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    <p className="text-xs font-mono text-cyber-400 font-semibold">UID: {p.freeFireUid}</p>
                    {p.inGameName && <p className="text-[11px] text-gray-400">IGN: {p.inGameName}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-dark-800 flex items-center justify-between gap-4">
              <button
                onClick={() => copyTeamUids(selectedTeam)}
                className="px-4 py-2.5 rounded-xl bg-dark-900 text-gray-200 hover:text-white border border-dark-750 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> Copy All 4 UIDs
              </button>

              <div className="flex items-center gap-2">
                {selectedTeam.status !== "approved" && (
                  <button
                    onClick={() => handleStatusChange(selectedTeam.id, "approved")}
                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                  >
                    Approve Squad
                  </button>
                )}
                {selectedTeam.status !== "rejected" && (
                  <button
                    onClick={() => handleStatusChange(selectedTeam.id, "rejected")}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                  >
                    Reject Squad
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
