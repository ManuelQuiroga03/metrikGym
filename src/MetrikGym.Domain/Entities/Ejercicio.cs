namespace MetrikGym.Domain.Entities;

public class Ejercicio
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string GrupoMuscular { get; set; } = string.Empty;
    public bool EsUnilateral { get; set; } = false;

    // Multi-tenant: Si es null, es del catálogo oficial global. Si tiene Id, es personalizado del usuario.
    public int? UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    // Relaciones de navegación
    public ICollection<RutinaEjercicio> RutinaEjercicios { get; set; } = [];
    public ICollection<SerieRegistro> SeriesRegistro { get; set; } = [];
}
