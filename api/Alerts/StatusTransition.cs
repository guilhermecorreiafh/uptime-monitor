namespace UptimeMonitor.Api.Alerts;
public static class StatusTransition
{
    public static bool ShouldAlert(bool? previousIsUp, bool currentIsUp) =>
        previousIsUp is not null && previousIsUp != currentIsUp;
}