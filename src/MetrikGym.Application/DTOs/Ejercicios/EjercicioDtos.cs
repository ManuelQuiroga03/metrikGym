using System.ComponentModel.DataAnnotations;

namespace MetrikGym.Application.DTOs.Ejercicios;

public record EjercicioDto(
    int Id,
    string Nombre,
    string GrupoMuscular,
    bool EsUnilateral,
    bool EsPersonalizado,
    int? UsuarioId
);

public record CreateEjercicioDto(
    [Required, StringLength(150)] string Nombre,
    [Required, StringLength(100)] string GrupoMuscular,
    bool EsUnilateral = false,
    bool CrearComoGlobal = false // Solo permitido para rol Admin
);

public record UpdateEjercicioDto(
    [Required, StringLength(150)] string Nombre,
    [Required, StringLength(100)] string GrupoMuscular,
    bool EsUnilateral = false
);
