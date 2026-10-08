export type MonitoredService = {
    id: number
    name: string
    url: string
    intervalSeconds : number
    timeoutSeconds : number
    isActive : boolean
    isUp: boolean | null
    lastCheckedAt : string | null
    lastResponseTimeMs : number | null
    createdAt: string
}

export type CheckResult = {
  checkedAt: string
  isSuccess: boolean
  statusCode: number | null
  responseTimeMs: number
  error: string | null
}