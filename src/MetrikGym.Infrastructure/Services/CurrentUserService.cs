using System.Security.Claims;
using MetrikGym.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace MetrikGym.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public int? UserId
    {
        get
        {
            var sub = User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? User?.FindFirstValue("sub");
            return int.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email => User?.FindFirstValue(ClaimTypes.Email) ?? User?.FindFirstValue("email");

    public string? Role => User?.FindFirstValue(ClaimTypes.Role) ?? User?.FindFirstValue("role");

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
}
