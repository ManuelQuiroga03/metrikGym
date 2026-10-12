using System.ComponentModel.DataAnnotations;
using MetrikGym.Application.DTOs.Ejercicios;

namespace MetrikGym.Application.DTOs.Rutinas;

public record RutinaEjercicioItemDto(
    int Id,
    int EjercicioId,
    string EjercicioNombre,
    string GrupoMuscular,
    bool EsUnilateral,
    int Orden,
    int SeriesObjetivo,
    int? DescansoSegundos
);

public record RutinaDto(
    int Id,
    int UsuarioId,
    string Nombre,
    string? DiaSugerido,
    bool Activa,
    List<RutinaEjercicioItemDto> Ejercicios
);

public record CreateRutinaEjercicioDto(
    [Required] int EjercicioId,
    [Required] int Orden,
    [Required, Range(1, 20)] int SeriesObjetivo,
    [Range(10, 600)] int? DescansoSegundos
);

public record CreateRutinaDto(
    [Required, StringLength(100)] string Nombre,
    [StringLength(50)] string? DiaSugerido,
    List<CreateRutinaEjercicioDto> Ejercicios
);

public record UpdateRutinaDto(
    [Required, StringLength(100)] string Nombre,
    [StringLength(50)] string? DiaSugerido,
    bool Activa,
    List<CreateRutinaEjercicioDto> Ejercicios
);
