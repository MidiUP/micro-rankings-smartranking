export interface Category {
  _id: string;
  category: string;
  description: string;
  events: Event[];
  players: string[];
}

export interface Event {
  name: string;
  operation: string;
  value: number;
}
