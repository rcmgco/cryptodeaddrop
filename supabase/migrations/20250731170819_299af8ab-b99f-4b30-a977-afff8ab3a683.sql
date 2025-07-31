-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.cleanup_expired_messages()
RETURNS void AS $$
BEGIN
    -- Log expired messages to analytics before deletion
    INSERT INTO public.analytics (event_type, recipient_address, message_id, metadata)
    SELECT 
        'message_expired',
        recipient_address,
        id,
        jsonb_build_object('expired_at', now(), 'was_read', is_read)
    FROM public.messages 
    WHERE expires_at <= now();
    
    -- Delete expired messages
    DELETE FROM public.messages 
    WHERE expires_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.validate_message_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate the correct expiration date based on expiration_days
    CASE NEW.expiration_days
        WHEN 1 THEN NEW.expires_at := NEW.created_at + INTERVAL '1 day';
        WHEN 10 THEN NEW.expires_at := NEW.created_at + INTERVAL '10 days';
        WHEN 30 THEN NEW.expires_at := NEW.created_at + INTERVAL '30 days';
        ELSE RAISE EXCEPTION 'Invalid expiration_days value: %', NEW.expiration_days;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';