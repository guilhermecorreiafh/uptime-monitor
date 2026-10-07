using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UptimeMonitor.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLastResponseTimeToMonitoredServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LastResponseTimeMs",
                table: "MonitoredServices",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastResponseTimeMs",
                table: "MonitoredServices");
        }
    }
}
