-- Eliminar el trigger anterior si existe
DROP TRIGGER IF EXISTS trg_actualizar_fecha_venta;

-- Crear el nuevo trigger BEFORE INSERT
DELIMITER $$

CREATE TRIGGER trg_actualizar_fecha_venta
BEFORE INSERT ON venta
FOR EACH ROW
BEGIN
    -- Declara una variable para almacenar la fecha encontrada
    DECLARE fecha_sorteo DATETIME;
    
    -- Busca la fecha del sorteo en la tabla 'rifa'
    SELECT fecha_hora_juego INTO fecha_sorteo
    FROM rifa
    WHERE id = NEW.id_rifas;
    
    -- Establece la columna 'fecha' antes de la inserción
    -- Usa DATE() si la columna fecha es tipo DATE, o déjalo como DATETIME si es DATETIME
    SET NEW.fecha = DATE(fecha_sorteo);
    
END$$

DELIMITER ;
