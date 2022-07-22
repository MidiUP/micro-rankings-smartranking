export interface Match {
  _id: string;
  category: string;
  challenge: string;
  players: string[];
  def: string;
  result: Result[];
}

export interface Result {
  set: string;
}
