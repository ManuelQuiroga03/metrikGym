namespace MetrikGym.Domain.Entities;

public class RutinaEjercicio
{
    public int Id { get; set; }
    public int RutinaId { get; set; }
    public int EjercicioId { get; set; }
    public int Orden { get; set; }
    public int SeriesObjetivo { get; set; }
    public int? DescansoSegundos { get; set; }

    // Relaciones de navegación
    public Rutina Rutina { get; set; } = null!;
    public Ejercicio Ejercicio { get; set; } = null!;
}
