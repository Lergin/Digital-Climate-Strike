import { Participation } from "../entity/Participation";

export enum WebSocketEvent {
  UPDATE = "update",
  CREATE = "create"
}

export type WebSocketMessage = {
  event: WebSocketEvent;
}

export type WebSocketParticipationMessage = WebSocketMessage & {
  type: 'participation';
  data: Participation
}
