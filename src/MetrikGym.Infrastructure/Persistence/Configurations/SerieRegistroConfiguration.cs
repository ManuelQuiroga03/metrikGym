using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class SerieRegistroConfiguration : IEntityTypeConfiguration<SerieRegistro>
{
    public void Configure(EntityTypeBuilder<SerieRegistro> builder)
    {
        builder.ToTable("SeriesRegistro");

        builder.HasKey(sr => sr.Id);

        // Peso en Kg: Precisión decimal(5,2) -> max 999.99 kg
        builder.Property(sr => sr.PesoKg)
            .HasPrecision(5, 2)
            .IsRequired();

        // RPE: Precisión decimal(3,1) -> max 10.0
        builder.Property(sr => sr.RPE)
            .HasPrecision(3, 1);

        builder.Property(sr => sr.Lado)
            .HasMaxLength(1);

        builder.HasOne(sr => sr.SesionEntrenamiento)
            .WithMany(s => s.SeriesRegistro)
            .HasForeignKey(sr => sr.SesionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(sr => sr.Ejercicio)
            .WithMany(e => e.SeriesRegistro)
            .HasForeignKey(sr => sr.EjercicioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(sr => new { sr.SesionId, sr.EjercicioId, sr.NumeroSerie });
    }
}
