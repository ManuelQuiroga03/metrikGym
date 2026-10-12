using System.ComponentModel.DataAnnotations;

namespace MetrikGym.Application.DTOs.Sesiones;

public record IniciarSesionDto(
    int? RutinaId,
    string? Notas
);

public record FinalizarSesionDto(
    string? Notas,
    DateTime? FechaHoraFinUtc
);

public record RegistrarSerieDto(
    [Required] int EjercicioId,
    [Required, Range(1, 50)] int NumeroSerie,
    [Required, Range(0, 999.99)] decimal PesoKg,
    [Required, Range(1, 500)] int Repeticiones,
    [RegularExpression("^[DI]$", ErrorMessage = "El lado debe ser 'D' (Derecho) o 'I' (Izquierdo)")] string? Lado,
    [Range(1.0, 10.0)] decimal? RPE
);

public record UpdateSerieDto(
    [Required, Range(0, 999.99)] decimal PesoKg,
    [Required, Range(1, 500)] int Repeticiones,
    [RegularExpression("^[DI]$", ErrorMessage = "El lado debe ser 'D' (Derecho) o 'I' (Izquierdo)")] string? Lado,
    [Range(1.0, 10.0)] decimal? RPE
);

public record SerieRegistroDto(
    int Id,
    int SesionId,
    int EjercicioId,
    string EjercicioNombre,
    string GrupoMuscular,
    int NumeroSerie,
    decimal PesoKg,
    int Repeticiones,
    char? Lado,
    decimal? RPE
);

public record SesionEntrenamientoDto(
    int Id,
    int UsuarioId,
    int? RutinaId,
    string RutinaNombre,
    DateTime FechaHoraInicio,
    DateTime? FechaHoraFin,
    string? Notas,
    List<SerieRegistroDto> Series
);

public record SyncSesionCompletaDto(
    int? RutinaId,
    string? RutinaNombre,
    DateTime FechaHoraInicio,
    DateTime? FechaHoraFin,
    string? Notas,
    List<RegistrarSerieDto> Series
);

public record ConsultarUltimosRegistrosDto(
    [Required] List<int> EjerciciosIds
);

public record UltimoRegistroEjercicioDto(
    int EjercicioId,
    string EjercicioNombre,
    DateTime FechaHora,
    decimal PesoKg,
    int Repeticiones,
    decimal? RPE,
    char? Lado
);
