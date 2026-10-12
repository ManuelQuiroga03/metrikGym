using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MetrikGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AllowNullableRutinaForFreeWorkouts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SesionesEntrenamiento_Rutinas_RutinaId",
                table: "SesionesEntrenamiento");

            migrationBuilder.AlterColumn<int>(
                name: "RutinaId",
                table: "SesionesEntrenamiento",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddForeignKey(
                name: "FK_SesionesEntrenamiento_Rutinas_RutinaId",
                table: "SesionesEntrenamiento",
                column: "RutinaId",
                principalTable: "Rutinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SesionesEntrenamiento_Rutinas_RutinaId",
                table: "SesionesEntrenamiento");

            migrationBuilder.AlterColumn<int>(
                name: "RutinaId",
                table: "SesionesEntrenamiento",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SesionesEntrenamiento_Rutinas_RutinaId",
                table: "SesionesEntrenamiento",
                column: "RutinaId",
                principalTable: "Rutinas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
