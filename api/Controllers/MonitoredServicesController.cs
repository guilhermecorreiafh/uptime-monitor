using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UptimeMonitor.Api.Data;
using UptimeMonitor.Api.Dtos;
using UptimeMonitor.Api.Models;

namespace UptimeMonitor.Api.Controllers;

[ApiController]
[Route("api/monitored-services")]
public class MonitoredServicesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<MonitoredServiceResponse>>> GetAll()
    {
        var services = await db.MonitoredServices
        .OrderBy(s => s.Id)
        .ToListAsync();

        return services.Select(ToResponse).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MonitoredServiceResponse>> GetById(int id)
    {
        var service = await db.MonitoredServices.FindAsync(id);

        if (service is null)
            return NotFound();

        return ToResponse(service);
    }

    [HttpPost]
    public async Task<ActionResult<MonitoredServiceResponse>> Create(MonitoredServiceRequest request)
    {
        var service = new MonitoredService
        {
            Name = request.Name,
            Url = request.Url,
            IntervalSeconds = request.IntervalSeconds,
            TimeoutSeconds = request.TimeoutSeconds,
            IsActive = request.IsActive
        };

        db.MonitoredServices.Add(service);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = service.Id }, ToResponse(service));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MonitoredServiceRequest request)
    {
        var service = await db.MonitoredServices.FindAsync(id);

        if (service is null)
            return NotFound();

        service.Name = request.Name;
        service.Url = request.Url;
        service.IntervalSeconds = request.IntervalSeconds;
        service.TimeoutSeconds = request.TimeoutSeconds;
        service.IsActive = request.IsActive;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await db.MonitoredServices.FindAsync(id);

        if (service is null)
            return NotFound();

        db.MonitoredServices.Remove(service);
        await db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id:int}/results")]
    public async Task<ActionResult<List<CheckResultResponse>>> GetResults(int id, [FromQuery] int limit = 50)
    {
        var exists = await db.MonitoredServices.AnyAsync(s => s.Id == id);

        if (!exists)
            return NotFound();

        limit = Math.Clamp(limit, 1, 500);

        var results = await db.CheckResults
        .Where(r => r.MonitoredServiceId == id)
        .OrderByDescending(r => r.CheckedAt)
        .Take(limit)
        .Select(r => new CheckResultResponse(
            r.CheckedAt, r.IsSuccess, r.StatusCode, r.ResponseTimeMs, r.Error))
        .ToListAsync();

        return results;
    }

    private static MonitoredServiceResponse ToResponse(MonitoredService s) =>
        new(s.Id, s.Name, s.Url, s.IntervalSeconds, s.TimeoutSeconds, s.IsActive, s.IsUp, s.CreatedAt);
}