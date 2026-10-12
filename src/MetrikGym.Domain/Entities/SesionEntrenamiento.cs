namespace MetrikGym.Domain.Entities;

public class SesionEntrenamiento
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int? RutinaId { get; set; }
    public DateTime FechaHoraInicio { get; set; } = DateTime.UtcNow;
    public DateTime? FechaHoraFin { get; set; }
    public string? Notas { get; set; }

    // Relaciones de navegación
    public Usuario Usuario { get; set; } = null!;
    public Rutina? Rutina { get; set; }
    public ICollection<SerieRegistro> SeriesRegistro { get; set; } = [];
}
