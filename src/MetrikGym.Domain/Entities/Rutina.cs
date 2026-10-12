namespace MetrikGym.Domain.Entities;

public class Rutina
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? DiaSugerido { get; set; }
    public bool Activa { get; set; } = true;

    // Relaciones de navegación
    public Usuario Usuario { get; set; } = null!;
    public ICollection<RutinaEjercicio> RutinaEjercicios { get; set; } = [];
    public ICollection<SesionEntrenamiento> SesionesEntrenamiento { get; set; } = [];
}
