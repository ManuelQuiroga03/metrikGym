-- Seed limpio para producción en Supabase
-- 1. Insertar Milo como Admin (Id=2)
INSERT INTO "Usuarios" ("Id", "Email", "PasswordHash", "Nombre", "TiempoDescansoDefectoSegundos", "Rol")
VALUES (2, 'quirogamanuel21@gmail.com', '$2a$11$qY8E2vXz0n5wM3tE3Q5vOuW7nK5vA0lR4pC2uN9iF7zK4jR3uV5pW', 'Milo', 180, 'Admin')
ON CONFLICT ("Id") DO UPDATE 
SET "Nombre" = EXCLUDED."Nombre", 
    "Rol" = EXCLUDED."Rol";

SELECT setval(pg_get_serial_sequence('"Usuarios"', 'Id'), COALESCE(MAX("Id"), 2)) FROM "Usuarios";

-- 2. Rutinas de Milo
INSERT INTO "Rutinas" ("Id", "UsuarioId", "Nombre", "DiaSugerido", "Activa") VALUES
(2, 2, 'Torso A: Pecho, hombro y tríceps', 'Lunes', true),
(3, 2, 'Pierna - Cuádriceps, gemelos y core', 'Martes', true),
(4, 2, 'Torso B: Espalda, Bíceps y deltoides', 'Jueves', true),
(5, 2, 'Pierna - Femoral, glúteo y core', 'Viernes', true)
ON CONFLICT ("Id") DO UPDATE 
SET "Nombre" = EXCLUDED."Nombre",
    "DiaSugerido" = EXCLUDED."DiaSugerido",
    "Activa" = EXCLUDED."Activa";

SELECT setval(pg_get_serial_sequence('"Rutinas"', 'Id'), COALESCE(MAX("Id"), 5)) FROM "Rutinas";

-- 3. Mapeo RutinaEjercicios
INSERT INTO "RutinaEjercicios" ("Id", "RutinaId", "EjercicioId", "Orden", "SeriesObjetivo", "DescansoSegundos") VALUES
(3, 2, 83, 1, 3, 180),
(4, 2, 87, 2, 3, 180),
(5, 2, 89, 3, 3, 180),
(6, 2, 111, 4, 3, 180),
(7, 2, 126, 5, 3, 180),
(8, 2, 125, 6, 3, 180),
(14, 3, 152, 1, 3, 180),
(15, 3, 132, 2, 3, 180),
(16, 3, 134, 3, 3, 180),
(17, 3, 135, 4, 3, 180),
(18, 3, 156, 5, 3, 180),
(19, 3, 155, 6, 3, 180),
(20, 4, 98, 1, 3, 180),
(21, 4, 101, 2, 3, 180),
(22, 4, 97, 3, 3, 180),
(23, 4, 114, 4, 3, 180),
(24, 4, 118, 5, 3, 180),
(25, 4, 119, 6, 3, 180),
(26, 5, 142, 1, 3, 180),
(27, 5, 139, 2, 3, 180),
(28, 5, 140, 3, 3, 180),
(29, 5, 146, 4, 3, 180),
(30, 5, 159, 5, 2, 180),
(31, 5, 158, 6, 2, 180)
ON CONFLICT ("Id") DO UPDATE
SET "RutinaId" = EXCLUDED."RutinaId",
    "EjercicioId" = EXCLUDED."EjercicioId",
    "Orden" = EXCLUDED."Orden",
    "SeriesObjetivo" = EXCLUDED."SeriesObjetivo",
    "DescansoSegundos" = EXCLUDED."DescansoSegundos";

SELECT setval(pg_get_serial_sequence('"RutinaEjercicios"', 'Id'), COALESCE(MAX("Id"), 31)) FROM "RutinaEjercicios";

-- 4. Asegurar que SesionesEntrenamiento y SeriesRegistro queden 100% limpias (0 registros)
TRUNCATE TABLE "SeriesRegistro", "SesionesEntrenamiento" RESTART IDENTITY;
