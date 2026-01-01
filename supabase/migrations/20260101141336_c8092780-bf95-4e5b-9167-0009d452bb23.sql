-- Update the handle_new_user function to auto-verify doctors and properly set profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  new_profile_id uuid;
  assigned_doctor uuid;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient');
  
  -- Create profile and get its ID
  INSERT INTO public.profiles (user_id, full_name, email, role, department, phone, specialization)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    user_role,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'specialization'
  )
  RETURNING id INTO new_profile_id;
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Create doctor profile for doctors (auto-verified when created)
  IF user_role IN ('hospital_doctor', 'online_doctor') THEN
    INSERT INTO public.doctor_profiles (user_id, doctor_type, profile_id, is_verified)
    VALUES (NEW.id, user_role::text, new_profile_id, true);
  END IF;
  
  -- Create patient record for patients with auto-assigned doctor
  IF user_role = 'patient' THEN
    -- Get an available doctor (random with less than 15 patients)
    assigned_doctor := get_available_doctor();
    
    INSERT INTO public.patients (user_id, profile_id, assigned_doctor_id)
    VALUES (NEW.id, new_profile_id, assigned_doctor);
  END IF;
  
  RETURN NEW;
END;
$$;