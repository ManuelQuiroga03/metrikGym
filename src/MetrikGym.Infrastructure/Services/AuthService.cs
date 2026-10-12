using MetrikGym.Application.DTOs.Auth;
using MetrikGym.Application.Interfaces;
using MetrikGym.Domain.Entities;
using MetrikGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MetrikGym.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        var existingUser = await _context.Usuarios
            .AnyAsync(u => u.Email.ToLower() == emailNormalized);

        if (existingUser)
        {
            throw new InvalidOperationException("El correo electrónico ya se encuentra registrado.");
        }

        // Si es el primer usuario del sistema, se le asigna rol Admin automáticamente
        var isFirstUser = !await _context.Usuarios.AnyAsync();
        var rol = isFirstUser ? "Admin" : "User";

        var usuario = new Usuario
        {
            Email = emailNormalized,
            Nombre = request.Nombre.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Rol = rol,
            TiempoDescansoDefectoSegundos = request.TiempoDescansoDefectoSegundos > 0 
                ? request.TiempoDescansoDefectoSegundos 
                : 90,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        var (token, expiresAtUtc) = _jwtProvider.GenerateToken(
            usuario.Id, 
            usuario.Email, 
            usuario.Nombre, 
            usuario.Rol);

        return new AuthResponseDto(
            usuario.Id,
            usuario.Email,
            usuario.Nombre,
            usuario.Rol,
            usuario.TiempoDescansoDefectoSegundos,
            token,
            expiresAtUtc
        );
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var emailNormalized = request.Email.Trim().ToLowerInvariant();

        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalized);

        if (usuario is null || !_passwordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            throw new UnauthorizedAccessException("Credenciales de acceso incorrectas.");
        }

        var (token, expiresAtUtc) = _jwtProvider.GenerateToken(
            usuario.Id, 
            usuario.Email, 
            usuario.Nombre, 
            usuario.Rol);

        return new AuthResponseDto(
            usuario.Id,
            usuario.Email,
            usuario.Nombre,
            usuario.Rol,
            usuario.TiempoDescansoDefectoSegundos,
            token,
            expiresAtUtc
        );
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (usuario is null) return null;

        return new UserProfileDto(
            usuario.Id,
            usuario.Email,
            usuario.Nombre,
            usuario.Rol,
            usuario.TiempoDescansoDefectoSegundos,
            usuario.FechaRegistro
        );
    }
}
