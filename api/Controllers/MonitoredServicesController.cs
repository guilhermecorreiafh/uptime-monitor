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

        return CreatedAtAction(nameof(GetById), new {id = service.Id}, ToResponse(service));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, MonitoredServiceRequest request)
    {
        var service = await db.MonitoredServices.FindAsync(id);

        if(service is null)
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
        
        if(service is null)
            return NotFound();

            db.MonitoredServices.Remove(service);
            await db.SaveChangesAsync();

            return NoContent();
    }


    private static MonitoredServiceResponse ToResponse(MonitoredService s) =>
        new(s.Id, s.Name, s.Url, s.IntervalSeconds, s.TimeoutSeconds, s.IsActive, s.CreatedAt);
}