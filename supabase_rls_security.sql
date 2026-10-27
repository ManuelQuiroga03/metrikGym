-- ==============================================================
-- BLINDAJE DE SEGURIDAD RLS PARA METRIKGYM EN SUPABASE
-- Resuelve la vulnerabilidad: rls_disabled_in_public
-- ==============================================================

-- 1. Habilitar Row-Level Security (RLS) en todas las tablas públicas
ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ejercicios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rutinas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RutinaEjercicios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SesionesEntrenamiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SeriesRegistro" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "__EFMigrationsHistory" ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas previas si existieran
DROP POLICY IF EXISTS "Lectura pública de Ejercicios" ON "Ejercicios";
DROP POLICY IF EXISTS "Lectura pública de Rutinas" ON "Rutinas";
DROP POLICY IF EXISTS "Lectura pública de RutinaEjercicios" ON "RutinaEjercicios";
DROP POLICY IF EXISTS "Lectura de Sesiones de Milo" ON "SesionesEntrenamiento";
DROP POLICY IF EXISTS "Inserción de Sesiones de Milo" ON "SesionesEntrenamiento";
DROP POLICY IF EXISTS "Lectura de Series" ON "SeriesRegistro";
DROP POLICY IF EXISTS "Inserción de Series" ON "SeriesRegistro";

-- 3. Tabla Ejercicios: Lectura pública (Catálogo de 80 ejercicios accesible por la app)
CREATE POLICY "Lectura pública de Ejercicios"
ON "Ejercicios" FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Tabla Rutinas y RutinaEjercicios: Lectura permitida para cargar en la app
CREATE POLICY "Lectura pública de Rutinas"
ON "Rutinas" FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Lectura pública de RutinaEjercicios"
ON "RutinaEjercicios" FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Tabla SesionesEntrenamiento: Lectura e Inserción para tu usuario (Milo: UsuarioId = 2)
CREATE POLICY "Lectura de Sesiones de Milo"
ON "SesionesEntrenamiento" FOR SELECT
TO anon, authenticated
USING ("UsuarioId" = 2);

CREATE POLICY "Inserción de Sesiones de Milo"
ON "SesionesEntrenamiento" FOR INSERT
TO anon, authenticated
WITH CHECK ("UsuarioId" = 2);

-- 6. Tabla SeriesRegistro: Lectura e Inserción para las series completadas
CREATE POLICY "Lectura de Series"
ON "SeriesRegistro" FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Inserción de Series"
ON "SeriesRegistro" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 7. Tabla Usuarios: AL NO CREAR POLÍTICA PARA anon, QUEDA 100% BLOQUEADA POR POSTGREST.
-- Nadie con la anon key podrá descargar passwords ni correos.
