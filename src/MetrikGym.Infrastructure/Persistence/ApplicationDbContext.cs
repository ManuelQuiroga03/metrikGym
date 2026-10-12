using System.Reflection;
using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MetrikGym.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Rutina> Rutinas => Set<Rutina>();
    public DbSet<Ejercicio> Ejercicios => Set<Ejercicio>();
    public DbSet<RutinaEjercicio> RutinaEjercicios => Set<RutinaEjercicio>();
    public DbSet<SesionEntrenamiento> SesionesEntrenamiento => Set<SesionEntrenamiento>();
    public DbSet<SerieRegistro> SeriesRegistro => Set<SerieRegistro>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Aplica automáticamente todas las configuraciones IEntityTypeConfiguration de este ensamblado
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
