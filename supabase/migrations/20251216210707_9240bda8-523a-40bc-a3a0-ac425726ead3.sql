-- Fix function search path for existing functions that don't have it set

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$function$;

-- Fix update_ticket_activity
CREATE OR REPLACE FUNCTION public.update_ticket_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
    UPDATE "tickets" SET "lastActivityAt" = now() WHERE "id" = NEW."ticketId";
    RETURN NEW;
END;
$function$;

-- Fix sync_display_name_preserve_custom
CREATE OR REPLACE FUNCTION public.sync_display_name_preserve_custom()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  generated_old text;
  generated_new text;
BEGIN
  generated_old := TRIM(CONCAT(COALESCE(OLD."firstName", ''), ' ', COALESCE(OLD."lastName", '')));
  generated_new := TRIM(CONCAT(COALESCE(NEW."firstName", ''), ' ', COALESCE(NEW."lastName", '')));

  IF TG_OP = 'INSERT' THEN
    IF NEW."displayName" IS NULL OR NEW."displayName" = '' THEN
      NEW."displayName" := generated_new;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE: only change displayName if it matched the previous generated value or was empty
  IF OLD."displayName" IS NULL OR OLD."displayName" = '' OR OLD."displayName" = generated_old THEN
    NEW."displayName" := generated_new;
  END IF;

  NEW."updatedAt" := now();
  RETURN NEW;
END;
$function$;