using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class RutinaEjercicioConfiguration : IEntityTypeConfiguration<RutinaEjercicio>
{
    public void Configure(EntityTypeBuilder<RutinaEjercicio> builder)
    {
        builder.ToTable("RutinaEjercicios");

        builder.HasKey(re => re.Id);

        builder.Property(re => re.Orden)
            .IsRequired();

        builder.Property(re => re.SeriesObjetivo)
            .IsRequired();

        builder.HasOne(re => re.Rutina)
            .WithMany(r => r.RutinaEjercicios)
            .HasForeignKey(re => re.RutinaId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict: Evita eliminar un ejercicio del catálogo si está asignado a rutinas
        builder.HasOne(re => re.Ejercicio)
            .WithMany(e => e.RutinaEjercicios)
            .HasForeignKey(re => re.EjercicioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(re => new { re.RutinaId, re.Orden });
    }
}
