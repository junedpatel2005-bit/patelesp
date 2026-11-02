export interface TournamentData {
  name: string;
  developer: string;
  whatsappNumber: string;
  paymentNumber: string;
  paymentName: string;
  tournamentDate: string;
  tournamentDay: string;
  tournamentTime: string;
  entryTime: string;
  hidePointsTable: boolean;
  squadPrice: number;
  winnerPrize: number;
  runnerUpPrize: number;
  thirdPrize: number;
  maxTeams: number;
  maxPlayers: number;
  isRegistrationOpen: boolean;
  updatedAt: string;
}

export interface PriceHistoryRecord {
  id: string;
  timestamp: string;
  squadPrice: number;
  winnerPrize: number;
  runnerUpPrize: number;
  thirdPrize: number;
  totalPrizePool: number;
  updatedBy: string;
  note?: string;
}

export interface PlayerInfo {
  name: string;
  uid?: string;
  phone?: string;
}

export interface TeamRegistration {
  id: string;
  slotNumber: number;
  teamName: string;
  igl: {
    name: string;
    uid?: string;
    phone: string;
  };
  player2: {
    name: string;
    uid?: string;
  };
  player3: {
    name: string;
    uid?: string;
  };
  player4: {
    name: string;
    uid?: string;
  };
  registeredAt: string;
}

export interface DatabaseSchema {
  tournament: TournamentData;
  priceHistory: PriceHistoryRecord[];
  teams: TeamRegistration[];
}
