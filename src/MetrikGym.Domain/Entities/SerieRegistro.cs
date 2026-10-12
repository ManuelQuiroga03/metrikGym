namespace MetrikGym.Domain.Entities;

public class SerieRegistro
{
    public int Id { get; set; }
    public int SesionId { get; set; }
    public int EjercicioId { get; set; }
    public int NumeroSerie { get; set; }
    public decimal PesoKg { get; set; }
    public int Repeticiones { get; set; }
    public char? Lado { get; set; } // 'D' (Derecho), 'I' (Izquierdo) o null
    public decimal? RPE { get; set; } // Escala de esfuerzo percibido 1.0 - 10.0

    // Relaciones de navegación
    public SesionEntrenamiento SesionEntrenamiento { get; set; } = null!;
    public Ejercicio Ejercicio { get; set; } = null!;
}
