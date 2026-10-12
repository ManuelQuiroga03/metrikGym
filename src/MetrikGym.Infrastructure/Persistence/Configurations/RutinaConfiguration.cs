using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class RutinaConfiguration : IEntityTypeConfiguration<Rutina>
{
    public void Configure(EntityTypeBuilder<Rutina> builder)
    {
        builder.ToTable("Rutinas");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(r => r.DiaSugerido)
            .HasMaxLength(50);

        builder.Property(r => r.Activa)
            .HasDefaultValue(true);

        builder.HasOne(r => r.Usuario)
            .WithMany(u => u.Rutinas)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(r => new { r.UsuarioId, r.Activa });
    }
}
