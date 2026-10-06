import type { MonitoredService } from "./types";

export async function getServices(): Promise<MonitoredService[]> {
    const response = await fetch('/api/monitored-services')

    if(!response.ok){
        throw new Error('Erro ao carregar serviços')
    }

    return response.json()
}