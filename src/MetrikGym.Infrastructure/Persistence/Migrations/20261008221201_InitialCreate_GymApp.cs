using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MetrikGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate_GymApp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ejercicios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    GrupoMuscular = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EsUnilateral = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ejercicios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TiempoDescansoDefectoSegundos = table.Column<int>(type: "integer", nullable: false, defaultValue: 90),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rutinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DiaSugerido = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Activa = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rutinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Rutinas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RutinaEjercicios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RutinaId = table.Column<int>(type: "integer", nullable: false),
                    EjercicioId = table.Column<int>(type: "integer", nullable: false),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    SeriesObjetivo = table.Column<int>(type: "integer", nullable: false),
                    DescansoSegundos = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RutinaEjercicios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RutinaEjercicios_Ejercicios_EjercicioId",
                        column: x => x.EjercicioId,
                        principalTable: "Ejercicios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RutinaEjercicios_Rutinas_RutinaId",
                        column: x => x.RutinaId,
                        principalTable: "Rutinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SesionesEntrenamiento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    RutinaId = table.Column<int>(type: "integer", nullable: false),
                    FechaHoraInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaHoraFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notas = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SesionesEntrenamiento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SesionesEntrenamiento_Rutinas_RutinaId",
                        column: x => x.RutinaId,
                        principalTable: "Rutinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SesionesEntrenamiento_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SeriesRegistro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SesionId = table.Column<int>(type: "integer", nullable: false),
                    EjercicioId = table.Column<int>(type: "integer", nullable: false),
                    NumeroSerie = table.Column<int>(type: "integer", nullable: false),
                    PesoKg = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    Repeticiones = table.Column<int>(type: "integer", nullable: false),
                    Lado = table.Column<char>(type: "character(1)", maxLength: 1, nullable: true),
                    RPE = table.Column<decimal>(type: "numeric(3,1)", precision: 3, scale: 1, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SeriesRegistro", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SeriesRegistro_Ejercicios_EjercicioId",
                        column: x => x.EjercicioId,
                        principalTable: "Ejercicios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SeriesRegistro_SesionesEntrenamiento_SesionId",
                        column: x => x.SesionId,
                        principalTable: "SesionesEntrenamiento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ejercicios_GrupoMuscular",
                table: "Ejercicios",
                column: "GrupoMuscular");

            migrationBuilder.CreateIndex(
                name: "IX_RutinaEjercicios_EjercicioId",
                table: "RutinaEjercicios",
                column: "EjercicioId");

            migrationBuilder.CreateIndex(
                name: "IX_RutinaEjercicios_RutinaId_Orden",
                table: "RutinaEjercicios",
                columns: new[] { "RutinaId", "Orden" });

            migrationBuilder.CreateIndex(
                name: "IX_Rutinas_UsuarioId_Activa",
                table: "Rutinas",
                columns: new[] { "UsuarioId", "Activa" });

            migrationBuilder.CreateIndex(
                name: "IX_SeriesRegistro_EjercicioId",
                table: "SeriesRegistro",
                column: "EjercicioId");

            migrationBuilder.CreateIndex(
                name: "IX_SeriesRegistro_SesionId_EjercicioId_NumeroSerie",
                table: "SeriesRegistro",
                columns: new[] { "SesionId", "EjercicioId", "NumeroSerie" });

            migrationBuilder.CreateIndex(
                name: "IX_SesionesEntrenamiento_RutinaId",
                table: "SesionesEntrenamiento",
                column: "RutinaId");

            migrationBuilder.CreateIndex(
                name: "IX_SesionesEntrenamiento_UsuarioId_FechaHoraInicio",
                table: "SesionesEntrenamiento",
                columns: new[] { "UsuarioId", "FechaHoraInicio" });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RutinaEjercicios");

            migrationBuilder.DropTable(
                name: "SeriesRegistro");

            migrationBuilder.DropTable(
                name: "Ejercicios");

            migrationBuilder.DropTable(
                name: "SesionesEntrenamiento");

            migrationBuilder.DropTable(
                name: "Rutinas");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
