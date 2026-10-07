import type { MonitoredService } from "./types";

export async function getServices(): Promise<MonitoredService[]> {
    const response = await fetch('/api/monitored-services')

    if(!response.ok){
        throw new Error('Erro ao carregar serviços')
    }

    return response.json()
}

export type NewService = {
    name: string
    url: string
    intervalSeconds : number
}

export async function  createService(service: NewService): Promise<void> {
    const response = await fetch('/api/monitored-services', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(service),
    })
    
    if (!response.ok){
        throw new Error('Verifique o nome e a URL (precisa começar com http:// ou https://)')
    }
}