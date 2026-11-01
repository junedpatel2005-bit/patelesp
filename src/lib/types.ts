export interface Player {
  name: string;
  freeFireUid: string;
  inGameName?: string;
  isCaptain?: boolean;
}

export interface TeamRegistration {
  id: string; // e.g., "PTL-1024"
  teamName: string;
  captainPhone: string;
  captainEmail?: string;
  players: [Player, Player, Player, Player];
  substitutePlayer?: Player;
  utrNumber: string; // UPI transaction reference
  entryFeePaid: number;
  paymentStatus: "pending" | "verified" | "rejected";
  status: "pending" | "approved" | "rejected";
  slotNumber?: number;
  createdAt: string;
  notes?: string;
}

export interface TournamentConfig {
  id: string;
  title: string;
  tagline: string;
  game: string;
  map: string;
  mode: string;
  entryFee: number;
  firstPrize: number;
  secondPrize: number;
  perKillPrize: number;
  totalPrizePool: number;
  maxSlots: number;
  matchDate: string;
  matchTime: string;
  upiId: string;
  upiName: string;
  roomId?: string;
  roomPassword?: string;
  roomAnnounced: boolean;
  rules: string[];
  contactNumber: string;
}

export interface AdminNotification {
  id: string;
  teamId: string;
  teamName: string;
  captainPhone: string;
  utrNumber: string;
  amount: number;
  createdAt: string;
  read: boolean;
}
