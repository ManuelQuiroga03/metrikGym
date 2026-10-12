using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class EjercicioConfiguration : IEntityTypeConfiguration<Ejercicio>
{
    public void Configure(EntityTypeBuilder<Ejercicio> builder)
    {
        builder.ToTable("Ejercicios");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Nombre)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(e => e.GrupoMuscular)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.EsUnilateral)
            .HasDefaultValue(false);

        // Relación opcional con Usuario para ejercicios personalizados
        builder.HasOne(e => e.Usuario)
            .WithMany(u => u.EjerciciosPersonalizados)
            .HasForeignKey(e => e.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.GrupoMuscular);
        builder.HasIndex(e => e.UsuarioId);
    }
}
