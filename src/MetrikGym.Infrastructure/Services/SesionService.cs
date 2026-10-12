using MetrikGym.Application.DTOs.Sesiones;
using MetrikGym.Application.Interfaces;
using MetrikGym.Domain.Entities;
using MetrikGym.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MetrikGym.Infrastructure.Services;

public class SesionService : ISesionService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SesionService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<SesionEntrenamientoDto> IniciarSesionAsync(IniciarSesionDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        if (dto.RutinaId.HasValue && dto.RutinaId.Value > 0)
        {
            var rutinaExiste = await _context.Rutinas.AnyAsync(r => r.Id == dto.RutinaId.Value && r.UsuarioId == userId);
            if (!rutinaExiste)
            {
                throw new InvalidOperationException("La rutina seleccionada no pertenece al usuario o no existe.");
            }
        }

        var sesion = new SesionEntrenamiento
        {
            UsuarioId = userId,
            RutinaId = (dto.RutinaId.HasValue && dto.RutinaId.Value > 0) ? dto.RutinaId.Value : null,
            FechaHoraInicio = DateTime.UtcNow,
            Notas = dto.Notas?.Trim()
        };

        _context.SesionesEntrenamiento.Add(sesion);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(sesion.Id))!;
    }

    public async Task<SesionEntrenamientoDto?> FinalizarSesionAsync(int sesionId, FinalizarSesionDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var sesion = await _context.SesionesEntrenamiento
            .FirstOrDefaultAsync(s => s.Id == sesionId && s.UsuarioId == userId);

        if (sesion is null) return null;

        sesion.FechaHoraFin = dto.FechaHoraFinUtc ?? DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.Notas))
        {
            sesion.Notas = dto.Notas.Trim();
        }

        await _context.SaveChangesAsync();
        return await GetByIdAsync(sesion.Id);
    }

    public async Task<SesionEntrenamientoDto?> GetSesionActivaAsync()
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var sesion = await _context.SesionesEntrenamiento
            .AsNoTracking()
            .Where(s => s.UsuarioId == userId && s.FechaHoraFin == null)
            .Include(s => s.Rutina)
            .Include(s => s.SeriesRegistro)
                .ThenInclude(sr => sr.Ejercicio)
            .OrderByDescending(s => s.FechaHoraInicio)
            .FirstOrDefaultAsync();

        return sesion is null ? null : MapToDto(sesion);
    }

    public async Task<SesionEntrenamientoDto?> GetByIdAsync(int id)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var sesion = await _context.SesionesEntrenamiento
            .AsNoTracking()
            .Where(s => s.Id == id && s.UsuarioId == userId)
            .Include(s => s.Rutina)
            .Include(s => s.SeriesRegistro)
                .ThenInclude(sr => sr.Ejercicio)
            .FirstOrDefaultAsync();

        return sesion is null ? null : MapToDto(sesion);
    }

    public async Task<List<SesionEntrenamientoDto>> GetHistorialAsync(int page = 1, int pageSize = 20)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var sesiones = await _context.SesionesEntrenamiento
            .AsNoTracking()
            .Where(s => s.UsuarioId == userId)
            .Include(s => s.Rutina)
            .Include(s => s.SeriesRegistro)
                .ThenInclude(sr => sr.Ejercicio)
            .OrderByDescending(s => s.FechaHoraInicio)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return sesiones.Select(MapToDto).ToList();
    }

    public async Task<SerieRegistroDto> RegistrarSerieAsync(int sesionId, RegistrarSerieDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var sesion = await _context.SesionesEntrenamiento
            .FirstOrDefaultAsync(s => s.Id == sesionId && s.UsuarioId == userId);

        if (sesion is null)
        {
            throw new InvalidOperationException("La sesión de entrenamiento no existe o no pertenece al usuario.");
        }

        var ejercicio = await _context.Ejercicios.FindAsync(dto.EjercicioId);
        if (ejercicio is null)
        {
            throw new InvalidOperationException("El ejercicio especificado no existe.");
        }

        char? ladoChar = !string.IsNullOrWhiteSpace(dto.Lado) ? char.ToUpper(dto.Lado[0]) : null;

        var serie = new SerieRegistro
        {
            SesionId = sesionId,
            EjercicioId = dto.EjercicioId,
            NumeroSerie = dto.NumeroSerie,
            PesoKg = dto.PesoKg,
            Repeticiones = dto.Repeticiones,
            Lado = ladoChar,
            RPE = dto.RPE
        };

        _context.SeriesRegistro.Add(serie);
        await _context.SaveChangesAsync();

        return new SerieRegistroDto(
            serie.Id,
            serie.SesionId,
            serie.EjercicioId,
            ejercicio.Nombre,
            ejercicio.GrupoMuscular,
            serie.NumeroSerie,
            serie.PesoKg,
            serie.Repeticiones,
            serie.Lado,
            serie.RPE
        );
    }

    public async Task<SerieRegistroDto?> UpdateSerieAsync(int serieId, UpdateSerieDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var serie = await _context.SeriesRegistro
            .Include(sr => sr.SesionEntrenamiento)
            .Include(sr => sr.Ejercicio)
            .FirstOrDefaultAsync(sr => sr.Id == serieId && sr.SesionEntrenamiento.UsuarioId == userId);

        if (serie is null) return null;

        char? ladoChar = !string.IsNullOrWhiteSpace(dto.Lado) ? char.ToUpper(dto.Lado[0]) : null;

        serie.PesoKg = dto.PesoKg;
        serie.Repeticiones = dto.Repeticiones;
        serie.Lado = ladoChar;
        serie.RPE = dto.RPE;

        await _context.SaveChangesAsync();

        return new SerieRegistroDto(
            serie.Id,
            serie.SesionId,
            serie.EjercicioId,
            serie.Ejercicio.Nombre,
            serie.Ejercicio.GrupoMuscular,
            serie.NumeroSerie,
            serie.PesoKg,
            serie.Repeticiones,
            serie.Lado,
            serie.RPE
        );
    }

    public async Task<bool> DeleteSerieAsync(int serieId)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        var serie = await _context.SeriesRegistro
            .Include(sr => sr.SesionEntrenamiento)
            .FirstOrDefaultAsync(sr => sr.Id == serieId && sr.SesionEntrenamiento.UsuarioId == userId);

        if (serie is null) return false;

        _context.SeriesRegistro.Remove(serie);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<UltimoRegistroEjercicioDto>> GetUltimosRegistrosAsync(List<int> ejerciciosIds)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        if (ejerciciosIds == null || ejerciciosIds.Count == 0) return [];

        var ultimosRegistros = await _context.SeriesRegistro
            .AsNoTracking()
            .Where(sr => sr.SesionEntrenamiento.UsuarioId == userId && ejerciciosIds.Contains(sr.EjercicioId))
            .OrderByDescending(sr => sr.SesionEntrenamiento.FechaHoraInicio)
            .ThenByDescending(sr => sr.NumeroSerie)
            .Select(sr => new
            {
                sr.EjercicioId,
                sr.Ejercicio.Nombre,
                sr.SesionEntrenamiento.FechaHoraInicio,
                sr.PesoKg,
                sr.Repeticiones,
                sr.RPE,
                sr.Lado
            })
            .ToListAsync();

        return ultimosRegistros
            .GroupBy(x => x.EjercicioId)
            .Select(g => g.First())
            .Select(x => new UltimoRegistroEjercicioDto(
                x.EjercicioId,
                x.Nombre,
                x.FechaHoraInicio,
                x.PesoKg,
                x.Repeticiones,
                x.RPE,
                x.Lado
            ))
            .ToList();
    }

    public async Task<SesionEntrenamientoDto> SyncSesionCompletaAsync(SyncSesionCompletaDto dto)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Usuario no autenticado.");

        int? validRutinaId = null;
        if (dto.RutinaId.HasValue && dto.RutinaId.Value > 0)
        {
            var rutinaExiste = await _context.Rutinas.AnyAsync(r => r.Id == dto.RutinaId.Value && r.UsuarioId == userId);
            if (rutinaExiste) validRutinaId = dto.RutinaId.Value;
        }

        var sesion = new SesionEntrenamiento
        {
            UsuarioId = userId,
            RutinaId = validRutinaId,
            FechaHoraInicio = dto.FechaHoraInicio.ToUniversalTime(),
            FechaHoraFin = dto.FechaHoraFin?.ToUniversalTime() ?? DateTime.UtcNow,
            Notas = dto.Notas?.Trim()
        };

        _context.SesionesEntrenamiento.Add(sesion);
        await _context.SaveChangesAsync();

        if (dto.Series != null && dto.Series.Count > 0)
        {
            foreach (var sDto in dto.Series)
            {
                var ejercicioExiste = await _context.Ejercicios.AnyAsync(e => e.Id == sDto.EjercicioId);
                if (!ejercicioExiste) continue;

                char? ladoChar = !string.IsNullOrWhiteSpace(sDto.Lado) ? char.ToUpper(sDto.Lado[0]) : null;

                var serie = new SerieRegistro
                {
                    SesionId = sesion.Id,
                    EjercicioId = sDto.EjercicioId,
                    NumeroSerie = sDto.NumeroSerie,
                    PesoKg = sDto.PesoKg,
                    Repeticiones = sDto.Repeticiones,
                    Lado = ladoChar,
                    RPE = sDto.RPE
                };

                _context.SeriesRegistro.Add(serie);
            }

            await _context.SaveChangesAsync();
        }

        return (await GetByIdAsync(sesion.Id))!;
    }

    private static SesionEntrenamientoDto MapToDto(SesionEntrenamiento s)
    {
        return new SesionEntrenamientoDto(
            s.Id,
            s.UsuarioId,
            s.RutinaId,
            s.Rutina?.Nombre ?? string.Empty,
            s.FechaHoraInicio,
            s.FechaHoraFin,
            s.Notas,
            s.SeriesRegistro
                .OrderBy(sr => sr.EjercicioId)
                .ThenBy(sr => sr.NumeroSerie)
                .Select(sr => new SerieRegistroDto(
                    sr.Id,
                    sr.SesionId,
                    sr.EjercicioId,
                    sr.Ejercicio?.Nombre ?? string.Empty,
                    sr.Ejercicio?.GrupoMuscular ?? string.Empty,
                    sr.NumeroSerie,
                    sr.PesoKg,
                    sr.Repeticiones,
                    sr.Lado,
                    sr.RPE
                ))
                .ToList()
        );
    }
}
