namespace UptimeMonitor.Api.Models;

public class MonitoredService
{
    public int Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public string Url {get; set;} = string.Empty;
    public int IntervalSeconds {get; set;} = 60;
    public int TimeoutSeconds {get; set;} = 10;
    public bool IsActive {get; set;} = true;
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
        public DateTime? LastCheckedAt { get; set; }
}