-- Create messages table for encrypted message storage
CREATE TABLE public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_address TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    sender_identifier TEXT, -- Optional identifier for sender (could be address or anonymous)
    expiration_days INTEGER NOT NULL CHECK (expiration_days IN (1, 10, 30))
);

-- Create analytics table for tracking platform usage
CREATE TABLE public.analytics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- 'message_encrypted', 'message_decrypted', 'message_expired'
    recipient_address TEXT,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB -- Additional event-specific data
);

-- Create indexes for performance
CREATE INDEX idx_messages_recipient_address ON public.messages(recipient_address);
CREATE INDEX idx_messages_expires_at ON public.messages(expires_at);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);
CREATE INDEX idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at DESC);

-- Create function to handle message expiration
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
-- Allow anyone to read messages (needed for searching by address)
CREATE POLICY "Anyone can view messages by recipient address" 
ON public.messages 
FOR SELECT 
USING (true);

-- Allow anyone to insert messages (anonymous message sending)
CREATE POLICY "Anyone can insert messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
    recipient_address IS NOT NULL 
    AND encrypted_content IS NOT NULL 
    AND expires_at > now()
    AND expiration_days IN (1, 10, 30)
);

-- Allow updating only the read status and read timestamp
CREATE POLICY "Allow updating read status" 
ON public.messages 
FOR UPDATE 
USING (true)
WITH CHECK (
    -- Only allow updating is_read and read_at fields
    OLD.id = NEW.id 
    AND OLD.recipient_address = NEW.recipient_address
    AND OLD.encrypted_content = NEW.encrypted_content
    AND OLD.created_at = NEW.created_at
    AND OLD.expires_at = NEW.expires_at
    AND OLD.expiration_days = NEW.expiration_days
);

-- Create RLS policies for analytics
-- Allow anyone to read analytics (for public statistics)
CREATE POLICY "Anyone can view analytics" 
ON public.analytics 
FOR SELECT 
USING (true);

-- Allow anyone to insert analytics events
CREATE POLICY "Anyone can insert analytics" 
ON public.analytics 
FOR INSERT 
WITH CHECK (
    event_type IS NOT NULL
    AND event_type IN ('message_encrypted', 'message_decrypted', 'message_expired')
);

-- Create a trigger to validate expiration date
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_message_expiration
    BEFORE INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_message_expiration();