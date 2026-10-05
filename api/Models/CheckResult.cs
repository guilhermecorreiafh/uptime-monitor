namespace UptimeMonitor.Api.Models;

public class CheckResult
{
    public long Id {get; set;}
    public int MonitoredServiceId {get; set;}
    public MonitoredService MonitoredService {get; set;} = null!;
    public DateTime CheckedAt {get; set;}
    public bool IsSuccess {get; set;}
    public int? StatusCode {get; set;}
    public int ResponseTimeMs {get; set;}
    public string? Error {get; set;}
}