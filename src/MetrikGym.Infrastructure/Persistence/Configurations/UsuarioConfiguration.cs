using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MetrikGym.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(u => u.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.Rol)
            .IsRequired()
            .HasMaxLength(50)
            .HasDefaultValue("User");

        builder.Property(u => u.TiempoDescansoDefectoSegundos)
            .HasDefaultValue(90);

        builder.Property(u => u.FechaRegistro)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
