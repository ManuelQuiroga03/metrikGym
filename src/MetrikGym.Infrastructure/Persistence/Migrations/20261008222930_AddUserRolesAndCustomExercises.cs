using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MetrikGym.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserRolesAndCustomExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Rol",
                table: "Usuarios",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "User");

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId",
                table: "Ejercicios",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ejercicios_UsuarioId",
                table: "Ejercicios",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ejercicios_Usuarios_UsuarioId",
                table: "Ejercicios",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ejercicios_Usuarios_UsuarioId",
                table: "Ejercicios");

            migrationBuilder.DropIndex(
                name: "IX_Ejercicios_UsuarioId",
                table: "Ejercicios");

            migrationBuilder.DropColumn(
                name: "Rol",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Ejercicios");
        }
    }
}
