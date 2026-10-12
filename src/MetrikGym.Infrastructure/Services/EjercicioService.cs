using MetrikGym.Application.DTOs.Ejercicios;
using MetrikGym.Application.Interfaces;
using MetrikGym.Domain.Entities;
using MetrikGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MetrikGym.Infrastructure.Services;

public class EjercicioService : IEjercicioService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public EjercicioService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<EjercicioDto>> GetEjerciciosAsync(string? grupoMuscular = null, string? search = null)
    {
        var currentUserId = _currentUser.UserId;

        // Devuelve ejercicios globales (UsuarioId == null) y los propios del usuario autenticado
        var query = _context.Ejercicios
            .AsNoTracking()
            .Where(e => e.UsuarioId == null || (currentUserId.HasValue && e.UsuarioId == currentUserId.Value));

        if (!string.IsNullOrWhiteSpace(grupoMuscular))
        {
            var grupo = grupoMuscular.Trim().ToLower();
            query = query.Where(e => e.GrupoMuscular.ToLower() == grupo);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(e => e.Nombre.ToLower().Contains(term));
        }

        return await query
            .OrderBy(e => e.GrupoMuscular)
            .ThenBy(e => e.Nombre)
            .Select(e => new EjercicioDto(
                e.Id,
                e.Nombre,
                e.GrupoMuscular,
                e.EsUnilateral,
                e.UsuarioId != null,
                e.UsuarioId
            ))
            .ToListAsync();
    }

    public async Task<EjercicioDto?> GetByIdAsync(int id)
    {
        var currentUserId = _currentUser.UserId;

        var e = await _context.Ejercicios
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && (x.UsuarioId == null || (currentUserId.HasValue && x.UsuarioId == currentUserId.Value)));

        if (e is null) return null;

        return new EjercicioDto(
            e.Id,
            e.Nombre,
            e.GrupoMuscular,
            e.EsUnilateral,
            e.UsuarioId != null,
            e.UsuarioId
        );
    }

    public async Task<EjercicioDto> CreateAsync(CreateEjercicioDto dto)
    {
        var currentUserId = _currentUser.UserId;
        var isAdmin = _currentUser.Role == "Admin";

        // Si es Admin y solicitó crearlo como global, se guarda sin UsuarioId
        int? usuarioIdAsignado = (isAdmin && dto.CrearComoGlobal) ? null : currentUserId;

        var ejercicio = new Ejercicio
        {
            Nombre = dto.Nombre.Trim(),
            GrupoMuscular = dto.GrupoMuscular.Trim(),
            EsUnilateral = dto.EsUnilateral,
            UsuarioId = usuarioIdAsignado
        };

        _context.Ejercicios.Add(ejercicio);
        await _context.SaveChangesAsync();

        return new EjercicioDto(
            ejercicio.Id,
            ejercicio.Nombre,
            ejercicio.GrupoMuscular,
            ejercicio.EsUnilateral,
            ejercicio.UsuarioId != null,
            ejercicio.UsuarioId
        );
    }

    public async Task<EjercicioDto?> UpdateAsync(int id, UpdateEjercicioDto dto)
    {
        var currentUserId = _currentUser.UserId;
        var isAdmin = _currentUser.Role == "Admin";

        var ejercicio = await _context.Ejercicios.FirstOrDefaultAsync(e => e.Id == id);
        if (ejercicio is null) return null;

        // Validación de permisos: un ejercicio global solo lo edita Admin; un personalizado, su autor
        if (ejercicio.UsuarioId == null && !isAdmin)
        {
            throw new UnauthorizedAccessException("Solo un administrador puede modificar ejercicios del catálogo global.");
        }

        if (ejercicio.UsuarioId != null && ejercicio.UsuarioId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("No tienes permisos para modificar este ejercicio.");
        }

        ejercicio.Nombre = dto.Nombre.Trim();
        ejercicio.GrupoMuscular = dto.GrupoMuscular.Trim();
        ejercicio.EsUnilateral = dto.EsUnilateral;

        await _context.SaveChangesAsync();

        return new EjercicioDto(
            ejercicio.Id,
            ejercicio.Nombre,
            ejercicio.GrupoMuscular,
            ejercicio.EsUnilateral,
            ejercicio.UsuarioId != null,
            ejercicio.UsuarioId
        );
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var currentUserId = _currentUser.UserId;
        var isAdmin = _currentUser.Role == "Admin";

        var ejercicio = await _context.Ejercicios.FirstOrDefaultAsync(e => e.Id == id);
        if (ejercicio is null) return false;

        if (ejercicio.UsuarioId == null && !isAdmin)
        {
            throw new UnauthorizedAccessException("Solo un administrador puede eliminar ejercicios del catálogo global.");
        }

        if (ejercicio.UsuarioId != null && ejercicio.UsuarioId != currentUserId && !isAdmin)
        {
            throw new UnauthorizedAccessException("No tienes permisos para eliminar este ejercicio.");
        }

        _context.Ejercicios.Remove(ejercicio);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<EjercicioDto?> PromoverAGlobalAsync(int id)
    {
        if (_currentUser.Role != "Admin")
        {
            throw new UnauthorizedAccessException("Solo un administrador puede promover ejercicios al catálogo global.");
        }

        var ejercicio = await _context.Ejercicios.FirstOrDefaultAsync(e => e.Id == id);
        if (ejercicio is null) return null;

        ejercicio.UsuarioId = null;
        await _context.SaveChangesAsync();

        return new EjercicioDto(
            ejercicio.Id,
            ejercicio.Nombre,
            ejercicio.GrupoMuscular,
            ejercicio.EsUnilateral,
            false,
            null
        );
    }
}
