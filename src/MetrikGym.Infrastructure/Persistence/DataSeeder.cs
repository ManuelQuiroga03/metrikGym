using MetrikGym.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MetrikGym.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Ejercicios.AnyAsync())
        {
            logger.LogInformation("El catálogo de ejercicios ya contiene datos. Omitiendo seed.");
            return;
        }

        logger.LogInformation("Poblando catálogo estándar de ejercicios en PostgreSQL...");

        var ejercicios = new List<Ejercicio>
        {
            // ================= PECHO =================
            new() { Nombre = "Press plano con barra", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press plano en máquina", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press plano con mancuernas", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press inclinado con barra", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press inclinado en máquina", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press inclinado con mancuernas", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Press declinado con barra", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Peck Deck / Pec Fly", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Aperturas con mancuernas en banco plano", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Aperturas con mancuernas en banco inclinado", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Aperturas en polea baja", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Aperturas inclinadas en polea baja", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Crossover / Cruces en polea alta", GrupoMuscular = "Pecho", EsUnilateral = false },
            new() { Nombre = "Fondos en paralelas (Pecho)", GrupoMuscular = "Pecho", EsUnilateral = false },

            // ================= ESPALDA =================
            new() { Nombre = "Dominadas pronas / supinas", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Jalón al pecho en polea", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Jalón al pecho con agarre neutro", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Remo con barra", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Remo en polea baja / Gironda", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Remo con mancuerna a una mano", GrupoMuscular = "Espalda", EsUnilateral = true },
            new() { Nombre = "Remo en máquina de palanca / pecho apoyado", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Pullover en polea alta", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Encogimientos de trapecio con mancuernas", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Encogimientos de trapecio con barra", GrupoMuscular = "Espalda", EsUnilateral = false },
            new() { Nombre = "Hiperextensiones lumbares en banco", GrupoMuscular = "Espalda", EsUnilateral = false },

            // ================= HOMBRO =================
            new() { Nombre = "Press militar con barra de pie/sentado", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Press militar con mancuernas", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Press militar en máquina", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Elevaciones laterales con mancuernas", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Elevaciones laterales en polea", GrupoMuscular = "Hombro", EsUnilateral = true },
            new() { Nombre = "Elevaciones frontales con mancuernas/barra", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Pájaros / Deltoide posterior con mancuernas", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Pájaros / Deltoide posterior en máquina", GrupoMuscular = "Hombro", EsUnilateral = false },
            new() { Nombre = "Face Pull en polea alta", GrupoMuscular = "Hombro", EsUnilateral = false },

            // ================= BÍCEPS =================
            new() { Nombre = "Curl de bíceps con barra Z", GrupoMuscular = "Bíceps", EsUnilateral = false },
            new() { Nombre = "Curl de bíceps con barra recta", GrupoMuscular = "Bíceps", EsUnilateral = false },
            new() { Nombre = "Curl alterno con mancuernas", GrupoMuscular = "Bíceps", EsUnilateral = true },
            new() { Nombre = "Curl Martillo con mancuernas", GrupoMuscular = "Bíceps", EsUnilateral = true },
            new() { Nombre = "Curl en banco Scott / Predicador", GrupoMuscular = "Bíceps", EsUnilateral = false },
            new() { Nombre = "Curl de bíceps en polea baja", GrupoMuscular = "Bíceps", EsUnilateral = false },
            new() { Nombre = "Curl concentrado con mancuerna", GrupoMuscular = "Bíceps", EsUnilateral = true },
            new() { Nombre = "Curl Spider con barra o mancuernas", GrupoMuscular = "Bíceps", EsUnilateral = false },

            // ================= TRÍCEPS =================
            new() { Nombre = "Press francés con barra Z", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Extensión en polea alta con cuerda", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Extensión en polea alta con barra recta/V", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Extensión trasnuca con cuerda en polea", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Extensión trasnuca con mancuerna (Copa)", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Fondos en banco / paralelas para tríceps", GrupoMuscular = "Tríceps", EsUnilateral = false },
            new() { Nombre = "Patada de tríceps en polea / mancuerna", GrupoMuscular = "Tríceps", EsUnilateral = true },

            // ================= CUÁDRICEPS =================
            new() { Nombre = "Sentadilla libre con barra", GrupoMuscular = "Cuádriceps", EsUnilateral = false },
            new() { Nombre = "Sentadilla en Multipower / Smith", GrupoMuscular = "Cuádriceps", EsUnilateral = false },
            new() { Nombre = "Sentadilla Hack", GrupoMuscular = "Cuádriceps", EsUnilateral = false },
            new() { Nombre = "Prensa de pierna inclinada a 45°", GrupoMuscular = "Cuádriceps", EsUnilateral = false },
            new() { Nombre = "Extensión de cuádriceps en máquina", GrupoMuscular = "Cuádriceps", EsUnilateral = false },
            new() { Nombre = "Sentadilla Búlgara con mancuernas", GrupoMuscular = "Cuádriceps", EsUnilateral = true },
            new() { Nombre = "Zancadas / Desplantes caminando", GrupoMuscular = "Cuádriceps", EsUnilateral = true },

            // ================= FEMORAL (ISQUIOSURALES) =================
            new() { Nombre = "Femoral sentado en máquina", GrupoMuscular = "Femoral", EsUnilateral = false },
            new() { Nombre = "Femoral tumbado en máquina", GrupoMuscular = "Femoral", EsUnilateral = false },
            new() { Nombre = "Femoral de pie unilateral en máquina", GrupoMuscular = "Femoral", EsUnilateral = true },
            new() { Nombre = "Peso muerto rumano con barra", GrupoMuscular = "Femoral", EsUnilateral = false },
            new() { Nombre = "Peso muerto rumano con mancuernas", GrupoMuscular = "Femoral", EsUnilateral = false },
            new() { Nombre = "Buenos días con barra", GrupoMuscular = "Femoral", EsUnilateral = false },

            // ================= GLÚTEO =================
            new() { Nombre = "Hip Thrust con barra", GrupoMuscular = "Glúteo", EsUnilateral = false },
            new() { Nombre = "Hip Thrust en máquina", GrupoMuscular = "Glúteo", EsUnilateral = false },
            new() { Nombre = "Abductores en máquina", GrupoMuscular = "Glúteo", EsUnilateral = false },
            new() { Nombre = "Patada de glúteo en polea", GrupoMuscular = "Glúteo", EsUnilateral = true },
            new() { Nombre = "Patada de glúteo en máquina", GrupoMuscular = "Glúteo", EsUnilateral = true },
            new() { Nombre = "Sentadilla Sumo con mancuerna/barra", GrupoMuscular = "Glúteo", EsUnilateral = false },

            // ================= ADUCTORES =================
            new() { Nombre = "Aductores en máquina", GrupoMuscular = "Aductores", EsUnilateral = false },
            new() { Nombre = "Aducción en polea baja", GrupoMuscular = "Aductores", EsUnilateral = true },

            // ================= GEMELOS / PANTORRILLA =================
            new() { Nombre = "Elevación de gemelos sentado en máquina", GrupoMuscular = "Gemelos", EsUnilateral = false },
            new() { Nombre = "Elevación de talones de pie en máquina / multipower", GrupoMuscular = "Gemelos", EsUnilateral = false },
            new() { Nombre = "Elevación de gemelos en prensa", GrupoMuscular = "Gemelos", EsUnilateral = false },

            // ================= ABDOMEN / CORE =================
            new() { Nombre = "Giros rusos (Russian twists)", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Elevaciones de pierna colgado en barra", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Elevaciones de pierna en banco / paralelas", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Crunch en polea alta", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Plancha isométrica (Plank)", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Rueda abdominal (Ab wheel)", GrupoMuscular = "Abdomen", EsUnilateral = false },
            new() { Nombre = "Vacío abdominal", GrupoMuscular = "Abdomen", EsUnilateral = false }
        };

        await context.Ejercicios.AddRangeAsync(ejercicios);
        await context.SaveChangesAsync();
        logger.LogInformation("Catálogo de ejercicios inicializado exitosamente con {Count} ejercicios.", ejercicios.Count);
    }
}
