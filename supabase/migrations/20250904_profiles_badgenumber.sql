-- Add badgenumber to profiles and update trigger to populate from metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badgenumber TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, middle_name, last_name, avatar_url, badgenumber)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'middle_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'badgenumber'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
