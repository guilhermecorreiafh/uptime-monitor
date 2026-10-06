export type MonitoredService = {
    id: number
    name: string
    url: string
    intervalSeconds : number
    timeoutSeconds : number
    isActive : boolean
    isUp: boolean | null
    createdAt: string
}