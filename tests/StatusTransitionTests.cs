using System.Threading.Channels;
using UptimeMonitor.Api.Alerts;

namespace UptimeMonitor.Tests;

public class StatusTransitionTests
{
    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public void ShouldAlert_QuandoStatusMuda_RetornaTrue(bool previous, bool current)
    {
        Assert.True(StatusTransition.ShouldAlert(previous, current));
    }

    [Theory]
    [InlineData(true, true)]
    [InlineData(false, false)]
    public void ShouldAlert_QuandoStatusContinuaIgual_RetornaFalse(bool previous, bool current)
    {
        Assert.False(StatusTransition.ShouldAlert(previous, current));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void ShouldAlert_NaPrimeiraChecagem_RetornaFalse(bool current)
    {
        Assert.False(StatusTransition.ShouldAlert(null, current));
    }
}