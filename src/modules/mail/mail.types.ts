export interface ISendMailInput {
  from?: string;
  to: string;
  subject: string;
  sender?: string;
  template: string;
  context: Record<string, unknown>;
}
