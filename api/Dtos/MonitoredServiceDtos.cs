using System.ComponentModel.DataAnnotations;

namespace UptimeMonitor.Api.Dtos;

public record MonitoredServiceRequest(
    [Required, MaxLength(100)] string Name,
    [Required, Url, MaxLength(500)] string Url,
    [Range(10, 3600)] int IntervalSeconds = 60,
    [Range(1, 60)] int TimeoutSeconds = 10,
    bool IsActive = true);

public record MonitoredServiceResponse(
    int Id,
    string Name,
    string Url,
    int IntervalSeconds,
    int TimeoutSeconds,
    bool IsActive,
    DateTime CreatedAt);