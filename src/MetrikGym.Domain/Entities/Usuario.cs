namespace MetrikGym.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = "User"; // "Admin" o "User"
    public int TiempoDescansoDefectoSegundos { get; set; } = 90;
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Relaciones de navegación
    public ICollection<Rutina> Rutinas { get; set; } = [];
    public ICollection<SesionEntrenamiento> SesionesEntrenamiento { get; set; } = [];
    public ICollection<Ejercicio> EjerciciosPersonalizados { get; set; } = [];
}
