using Microsoft.EntityFrameworkCore;
using UptimeMonitor.Api.Data;
using Scalar.AspNetCore;
using UptimeMonitor.Api.Workers;
using UptimeMonitor.Api.Alerts;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHttpClient();
builder.Services.AddHostedService<UptimeCheckWorker>();

builder.Services.AddSingleton<DiscordAlertService>();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("uptime-monitor-api"))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddNpgsql())
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddMeter("UptimeMonitor"))
    .WithLogging(logging => { }, options => options.IncludeFormattedMessage = true)
    .UseOtlpExporter();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
