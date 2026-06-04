-- ============================================================
-- migracion_auth.sql
-- Ajustes sobre la BD existente para soportar el backend de auth
-- Ejecutar UNA SOLA VEZ sobre la BD ya creada con EstructuraCompleta.sql
-- ============================================================

-- ── 1. La columna tokenVerif ya existe en registros (varchar 200).
--       El backend la reutiliza para guardar el código de reset
--       en formato: "RESET:<codigo>:<timestampMs>"
--       No requiere cambios si ya fue creada con el SQL original.

-- ── 2. Índice de búsqueda rápida por email (mejora performance del login)
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_registros_email' AND object_id = OBJECT_ID('registros')
)
BEGIN
  CREATE INDEX IX_registros_email ON registros(email);
  PRINT 'Índice IX_registros_email creado.';
END
GO

-- ── 3. Índice en logins por registro
IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = 'IX_logins_registro' AND object_id = OBJECT_ID('logins')
)
BEGIN
  CREATE INDEX IX_logins_registro ON logins(registro);
  PRINT 'Índice IX_logins_registro creado.';
END
GO

-- ── 4. Vista útil para el panel de admin: usuarios pendientes de validación
CREATE OR ALTER VIEW vw_RegistrosPendientes AS
  SELECT
    r.identificador  AS registroId,
    p.identificador  AS personaId,
    p.nombre,
    p.documento,
    r.email,
    p.direccion,
    r.fechaRegistro,
    r.validado,
    r.motivoRechazo,
    l.intentosFallidos,
    l.bloqueado,
    l.ultimoAcceso
  FROM registros r
  INNER JOIN personas p ON p.identificador = r.persona
  LEFT  JOIN logins   l ON l.registro      = r.identificador
  WHERE r.validado = 0;
GO

-- ── 5. Vista de todos los usuarios con su estado
CREATE OR ALTER VIEW vw_UsuariosCompleto AS
  SELECT
    r.identificador  AS registroId,
    p.identificador  AS personaId,
    p.nombre,
    p.documento,
    r.email,
    p.estado         AS estadoPersona,
    r.validado,
    r.motivoRechazo,
    r.fechaRegistro,
    l.bloqueado,
    l.intentosFallidos,
    l.ultimoAcceso
  FROM registros r
  INNER JOIN personas p ON p.identificador = r.persona
  LEFT  JOIN logins   l ON l.registro      = r.identificador;
GO

-- ── 6. Stored Procedure: aprobar usuario (validado = 1)
CREATE OR ALTER PROCEDURE sp_AprobarUsuario
  @registroId INT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE registros
  SET validado      = 1,
      motivoRechazo = NULL
  WHERE identificador = @registroId;

  SELECT @@ROWCOUNT AS filaAfectadas;
END
GO

-- ── 7. Stored Procedure: rechazar usuario (validado = 0 + motivo)
CREATE OR ALTER PROCEDURE sp_RechazarUsuario
  @registroId    INT,
  @motivoRechazo VARCHAR(300)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE registros
  SET validado      = 0,
      motivoRechazo = @motivoRechazo
  WHERE identificador = @registroId;

  SELECT @@ROWCOUNT AS filasAfectadas;
END
GO

-- ── 8. Stored Procedure: desbloquear cuenta por intentos fallidos
CREATE OR ALTER PROCEDURE sp_DesbloquearLogin
  @registroId INT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE logins
  SET bloqueado        = 0,
      intentosFallidos = 0
  WHERE registro = @registroId;

  SELECT @@ROWCOUNT AS filasAfectadas;
END
GO

-- ── 9. Consulta de verificación: lista todos los usuarios pendientes
-- SELECT * FROM vw_RegistrosPendientes ORDER BY fechaRegistro DESC;

-- ── 10. Para aprobar manualmente desde SSMS:
-- EXEC sp_AprobarUsuario  @registroId = 1;
-- EXEC sp_RechazarUsuario @registroId = 2, @motivoRechazo = 'Documentación inválida';

PRINT 'Migración aplicada correctamente.';
GO
