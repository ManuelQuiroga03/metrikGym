using MetrikGym.Application.DTOs.Rutinas;
using MetrikGym.Application.Interfaces;
using MetrikGym.Domain.Entities;
using MetrikGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MetrikGym.Infrastructure.Services;

public class RutinaService : IRutinaService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RutinaService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<RutinaDto>> GetRutinasAsync()
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var rutinas = await _context.Rutinas
            .AsNoTracking()
            .Where(r => r.UsuarioId == userId)
            .Include(r => r.RutinaEjercicios)
                .ThenInclude(re => re.Ejercicio)
            .OrderBy(r => r.Nombre)
            .ToListAsync();

        return rutinas.Select(MapToDto).ToList();
    }

    public async Task<RutinaDto?> GetByIdAsync(int id)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var rutina = await _context.Rutinas
            .AsNoTracking()
            .Where(r => r.Id == id && r.UsuarioId == userId)
            .Include(r => r.RutinaEjercicios)
                .ThenInclude(re => re.Ejercicio)
            .FirstOrDefaultAsync();

        return rutina is null ? null : MapToDto(rutina);
    }

    public async Task<RutinaDto> CreateAsync(CreateRutinaDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var rutina = new Rutina
        {
            UsuarioId = userId,
            Nombre = dto.Nombre.Trim(),
            DiaSugerido = dto.DiaSugerido?.Trim(),
            Activa = true,
            RutinaEjercicios = dto.Ejercicios.Select(e => new RutinaEjercicio
            {
                EjercicioId = e.EjercicioId,
                Orden = e.Orden,
                SeriesObjetivo = e.SeriesObjetivo,
                DescansoSegundos = e.DescansoSegundos
            }).ToList()
        };

        _context.Rutinas.Add(rutina);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(rutina.Id))!;
    }

    public async Task<RutinaDto?> UpdateAsync(int id, UpdateRutinaDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var rutina = await _context.Rutinas
            .Include(r => r.RutinaEjercicios)
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId);

        if (rutina is null) return null;

        rutina.Nombre = dto.Nombre.Trim();
        rutina.DiaSugerido = dto.DiaSugerido?.Trim();
        rutina.Activa = dto.Activa;

        // Reemplazo eficiente de la lista de ejercicios de la rutina
        _context.RutinaEjercicios.RemoveRange(rutina.RutinaEjercicios);

        rutina.RutinaEjercicios = dto.Ejercicios.Select(e => new RutinaEjercicio
        {
            RutinaId = rutina.Id,
            EjercicioId = e.EjercicioId,
            Orden = e.Orden,
            SeriesObjetivo = e.SeriesObjetivo,
            DescansoSegundos = e.DescansoSegundos
        }).ToList();

        await _context.SaveChangesAsync();

        return await GetByIdAsync(rutina.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var rutina = await _context.Rutinas.FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == userId);
        if (rutina is null) return false;

        _context.Rutinas.Remove(rutina);
        await _context.SaveChangesAsync();
        return true;
    }

    private static RutinaDto MapToDto(Rutina r)
    {
        return new RutinaDto(
            r.Id,
            r.UsuarioId,
            r.Nombre,
            r.DiaSugerido,
            r.Activa,
            r.RutinaEjercicios
                .OrderBy(re => re.Orden)
                .Select(re => new RutinaEjercicioItemDto(
                    re.Id,
                    re.EjercicioId,
                    re.Ejercicio?.Nombre ?? string.Empty,
                    re.Ejercicio?.GrupoMuscular ?? string.Empty,
                    re.Ejercicio?.EsUnilateral ?? false,
                    re.Orden,
                    re.SeriesObjetivo,
                    re.DescansoSegundos
                ))
                .ToList()
        );
    }
}
