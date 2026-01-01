-- Create a function to get an available doctor for patient assignment
-- Returns a random doctor with less than 15 patients, or NULL if all are full
CREATE OR REPLACE FUNCTION public.get_available_doctor()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  available_doctor_id uuid;
BEGIN
  -- Get a random verified doctor (hospital_doctor or online_doctor) with less than 15 patients
  SELECT dp.profile_id INTO available_doctor_id
  FROM doctor_profiles dp
  JOIN profiles p ON dp.profile_id = p.id
  WHERE dp.is_verified = true
    AND (
      SELECT COUNT(*) 
      FROM patients pat 
      WHERE pat.assigned_doctor_id = dp.profile_id
    ) < 15
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN available_doctor_id;
END;
$$;

-- Update the handle_new_user function to auto-assign doctors
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