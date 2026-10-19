export type MessageType = 'info' | 'warning' | 'error';

/** One line for `Banner` to render — Eg explaining what a form field actually affects before the
 *  user picks a value, or surfacing a result after an action. */
export interface Message {
  type: MessageType;
  text: string;
}
