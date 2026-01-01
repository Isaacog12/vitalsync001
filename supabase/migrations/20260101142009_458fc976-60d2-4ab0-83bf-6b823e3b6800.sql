-- Create doctor_change_requests table for patients to request different doctors
CREATE TABLE public.doctor_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  current_doctor_id UUID REFERENCES public.profiles(id),
  requested_doctor_id UUID REFERENCES public.profiles(id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_change_requests ENABLE ROW LEVEL SECURITY;

-- Patients can view their own requests
CREATE POLICY "Patients can view own change requests"
ON public.doctor_change_requests
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM patients
  WHERE patients.id = doctor_change_requests.patient_id
  AND patients.user_id = auth.uid()
));

-- Patients can create change requests
CREATE POLICY "Patients can create change requests"
ON public.doctor_change_requests
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM patients
  WHERE patients.id = doctor_change_requests.patient_id
  AND patients.user_id = auth.uid()
));

-- Admins can manage all requests
CREATE POLICY "Admins can manage change requests"
ON public.doctor_change_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for patients to view doctor profiles for browsing
CREATE POLICY "Patients can view verified doctors"
ON public.doctor_profiles
FOR SELECT
USING (
  is_verified = true 
  AND has_role(auth.uid(), 'patient'::app_role)
);

-- Patients need to view doctor profile details (full_name, email, phone)
CREATE POLICY "Patients can view doctor profile details"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'patient'::app_role)
  AND role IN ('hospital_doctor', 'online_doctor')
);