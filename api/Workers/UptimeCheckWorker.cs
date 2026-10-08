using System.Diagnostics;
using System.Diagnostics.Metrics;
using Microsoft.EntityFrameworkCore;
using UptimeMonitor.Api.Alerts;
using UptimeMonitor.Api.Data;
using UptimeMonitor.Api.Models;

namespace UptimeMonitor.Api.Workers;

public class UptimeCheckWorker(
    IServiceScopeFactory scopeFactory,
    IHttpClientFactory httpClientFactory,
    DiscordAlertService alertService,
    ILogger<UptimeCheckWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Tick = TimeSpan.FromSeconds(5);

    private static readonly Meter Meter = new("UptimeMonitor");

    private static readonly Counter<long> ChecksCounter =
        Meter.CreateCounter<long>("uptime.checks", description: "Checagens executadas");

    private static readonly Histogram<int> ResponseTimeHistogram =
        Meter.CreateHistogram<int>("uptime.response_time", unit: "ms", description: "Tempo de resposta das checagens");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Tick);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await CheckDueServicesAsync(stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                logger.LogError(ex, "Erro no ciclo de checagem");
            }
        }
    }

    private async Task CheckDueServicesAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTime.UtcNow;

        var services = await db.MonitoredServices
            .Where(s => s.IsActive)
            .ToListAsync(ct);

        var dueServices = services.Where(s =>
            s.LastCheckedAt is null ||
            (now - s.LastCheckedAt.Value).TotalSeconds >= s.IntervalSeconds);

        foreach (var service in dueServices)
        {
            var result = await CheckAsync(service, ct);

            var tags = new TagList
            {
                { "service", service.Name },
                { "status", result.IsSuccess ? "up" : "down" }
            };

            ChecksCounter.Add(1, tags);
            ResponseTimeHistogram.Record(result.ResponseTimeMs, tags);

            db.CheckResults.Add(result);
            service.LastCheckedAt = result.CheckedAt;

            var previousIsUp = service.IsUp;
            service.IsUp = result.IsSuccess;
            service.LastResponseTimeMs = result.ResponseTimeMs;

            if (StatusTransition.ShouldAlert(previousIsUp, result.IsSuccess))
            {
                var message = result.IsSuccess
                    ? $"✅ **{service.Name}** voltou ao ar ({result.ResponseTimeMs}ms)"
                    : $"🔴 **{service.Name}** caiu: {result.Error ?? $"status {result.StatusCode}"}";

                await alertService.SendAsync(message, ct);
            }

            logger.LogInformation(
                "{Name}: {Status} em {Ms}ms",
                service.Name,
                result.IsSuccess ? "UP" : "DOWN",
                result.ResponseTimeMs);
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task<CheckResult> CheckAsync(MonitoredService service, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(service.TimeoutSeconds);

        var result = new CheckResult
        {
            MonitoredServiceId = service.Id,
            CheckedAt = DateTime.UtcNow
        };

        var stopwatch = Stopwatch.StartNew();

        try
        {
            using var response = await client.GetAsync(
                service.Url, HttpCompletionOption.ResponseHeadersRead, ct);

            result.StatusCode = (int)response.StatusCode;
            result.IsSuccess = response.IsSuccessStatusCode;
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            result.IsSuccess = false;
            result.Error = ex.Message.Length > 500 ? ex.Message[..500] : ex.Message;
        }

        stopwatch.Stop();
        result.ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds;

        return result;
    }
}
