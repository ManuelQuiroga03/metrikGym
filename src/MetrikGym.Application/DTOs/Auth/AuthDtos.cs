using System.ComponentModel.DataAnnotations;

namespace MetrikGym.Application.DTOs.Auth;

public record RegisterRequestDto(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required, StringLength(100)] string Nombre,
    int TiempoDescansoDefectoSegundos = 90
);

public record LoginRequestDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponseDto(
    int Id,
    string Email,
    string Nombre,
    string Rol,
    int TiempoDescansoDefectoSegundos,
    string Token,
    DateTime ExpiresAtUtc
);

public record UserProfileDto(
    int Id,
    string Email,
    string Nombre,
    string Rol,
    int TiempoDescansoDefectoSegundos,
    DateTime FechaRegistro
);
