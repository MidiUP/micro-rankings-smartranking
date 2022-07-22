export interface RankingResponse {
  player?: string;
  position?: number;
  score?: number;
  historyMatchs?: History;
}

export interface History {
  victories?: number;
  defeats?: number;
}
