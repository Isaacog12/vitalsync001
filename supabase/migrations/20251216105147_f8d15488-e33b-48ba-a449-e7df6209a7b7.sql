-- Update the handle_new_user function to also create patient records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
  new_profile_id uuid;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient');
  
  -- Create profile and get its ID
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    user_role
  )
  RETURNING id INTO new_profile_id;
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Create doctor profile for doctors
  IF user_role IN ('hospital_doctor', 'online_doctor') THEN
    INSERT INTO public.doctor_profiles (user_id, doctor_type, profile_id)
    VALUES (NEW.id, user_role::text, new_profile_id);
  END IF;
  
  -- Create patient record for patients
  IF user_role = 'patient' THEN
    INSERT INTO public.patients (user_id, profile_id)
    VALUES (NEW.id, new_profile_id);
  END IF;
  
  RETURN NEW;
END;
$$;