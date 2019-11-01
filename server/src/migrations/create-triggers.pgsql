CREATE OR REPLACE FUNCTION checkOrderResolution() RETURNS TRIGGER AS
$BODY$
BEGIN
    IF NEW._resolution_status='resolve' THEN
        IF (SELECT COUNT(*) FROM order_item WHERE order_id=NEW.id AND serial_number IS NULL) > 0 THEN
            RAISE EXCEPTION 'EMPTY_SERIAL_NUMBER';
        END IF;
    END IF;

    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER checkOrderResolutionTrigger BEFORE
UPDATE ON "order" FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE PROCEDURE checkOrderResolution();

-- ###########################
CREATE OR REPLACE FUNCTION changeOrderResolution() RETURNS TRIGGER AS
$BODY$
BEGIN
    IF OLD._resolution_status IS NULL AND NEW._resolution_status IS NOT NULL THEN
        UPDATE "order" SET resolution_date=now() WHERE id=NEW.id;
    END IF;

    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER changeOrderResolutionTrigger AFTER
UPDATE ON "order" FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE PROCEDURE changeOrderResolution();

-- ###########################
CREATE OR REPLACE FUNCTION checkGoodUpdateEnabled() RETURNS TRIGGER AS
$BODY$
BEGIN
    IF (NEW.branch='archive'::citext) THEN
        NEW.updated=now();
        RETURN NEW;
    END IF;

    IF (SELECT COUNT(*) FROM order_item WHERE good_id=NEW.id) > 0 THEN
        RAISE EXCEPTION 'GOOD_USED_IN_ORDER';
    END IF;

    NEW.updated=now();
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER checkGoodUpdateEnabledTrigger BEFORE
UPDATE ON good FOR EACH ROW WHEN (pg_trigger_depth() < 1)
EXECUTE PROCEDURE checkGoodUpdateEnabled();
