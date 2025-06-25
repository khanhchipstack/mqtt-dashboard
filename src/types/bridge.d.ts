export interface Bridge {
  name: string
  enable: boolean
  parallel: number
  connector: {
    server: string
    proto_ver: number
    clientid: string | null
    clean_start: boolean
    username: string
    password: string
    keepalive: number
  }
  forwards: Array<{
    remote_topic: string
    local_topic: string
  }>
  subscription: Array<{
    remote_topic: string
    local_topic: string
    qos: number
  }>
  status?: string
  messages_forwarded?: number
  messages_received?: number
  last_activity?: string
}