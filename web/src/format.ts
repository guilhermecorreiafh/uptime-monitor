export function timeAgo(isoDate: string | null): string {
    if (!isoDate) return 'nunca checado'

    const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000))

    if (seconds < 60) return `há ${seconds}s`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `há ${minutes} min`

    const hours = Math.floor(minutes / 60)
    return `há ${hours} h`
}