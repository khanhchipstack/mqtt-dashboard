export interface Subscription {
  clientid: string
  topic: string
  qos: number
  created_at?: string
  message_count?: number
}