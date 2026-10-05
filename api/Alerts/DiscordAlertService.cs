namespace UptimeMonitor.Api.Alerts;
public class DiscordAlertService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<DiscordAlertService> logger)
{
    public async Task SendAsync(string message, CancellationToken ct)
    {
        var webhookUrl = configuration["Alerts:DiscordWebhookUrl"];

        if(string.IsNullOrWhiteSpace(webhookUrl))
        {
            logger.LogWarning("Webhook do Discord não configurado. Alerta ignorado: {Message}", message);
            return;
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(webhookUrl, new {content = message}, ct);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            logger.LogError(ex, "Falha ao enviar alerta para o Discord.");
        }
    }
}