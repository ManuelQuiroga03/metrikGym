using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class SesionEntrenamientoConfiguration : IEntityTypeConfiguration<SesionEntrenamiento>
{
    public void Configure(EntityTypeBuilder<SesionEntrenamiento> builder)
    {
        builder.ToTable("SesionesEntrenamiento");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Notas)
            .HasMaxLength(1000);

        builder.Property(s => s.FechaHoraInicio)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        // Restrict: Proteger el historial del usuario ante eliminaciones accidentales
        builder.HasOne(s => s.Usuario)
            .WithMany(u => u.SesionesEntrenamiento)
            .HasForeignKey(s => s.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // SetNull / Restrict: Mantener el histórico de la sesión aunque la rutina plantilla sea eliminada o sea entreno libre
        builder.HasOne(s => s.Rutina)
            .WithMany(r => r.SesionesEntrenamiento)
            .HasForeignKey(s => s.RutinaId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(s => new { s.UsuarioId, s.FechaHoraInicio });
    }
}
