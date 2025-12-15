-- Phase 1c: RLS Policies for all new tables

-- RLS Policies for doctor_profiles
CREATE POLICY "Admins can manage doctor profiles" ON public.doctor_profiles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view own profile" ON public.doctor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public can view verified doctors" ON public.doctor_profiles FOR SELECT USING (is_verified = true);

-- RLS Policies for emr_records
CREATE POLICY "Admins can view all EMR" ON public.emr_records FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Hospital doctors can access all EMR" ON public.emr_records FOR ALL USING (has_role(auth.uid(), 'hospital_doctor'));
CREATE POLICY "Online doctors can access outpatient EMR" ON public.emr_records FOR SELECT USING (has_role(auth.uid(), 'online_doctor') AND is_inpatient = false);
CREATE POLICY "Online doctors can insert EMR" ON public.emr_records FOR INSERT WITH CHECK (has_role(auth.uid(), 'online_doctor'));
CREATE POLICY "Patients can view own EMR" ON public.emr_records FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = emr_records.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for appointments
CREATE POLICY "Admins can manage appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view their appointments" ON public.appointments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = appointments.doctor_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Doctors can update their appointments" ON public.appointments FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = appointments.doctor_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Patients can cancel own appointments" ON public.appointments FOR UPDATE USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = appointments.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for consultations
CREATE POLICY "Admins can view all consultations" ON public.consultations FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can manage their consultations" ON public.consultations FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = consultations.doctor_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Patients can view own consultations" ON public.consultations FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = consultations.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for prescriptions
CREATE POLICY "Admins can view all prescriptions" ON public.prescriptions FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions FOR ALL USING (has_role(auth.uid(), 'hospital_doctor') OR has_role(auth.uid(), 'online_doctor'));
CREATE POLICY "Nurses can view prescriptions" ON public.prescriptions FOR SELECT USING (has_role(auth.uid(), 'nurse'));
CREATE POLICY "Pharmacists can view prescriptions" ON public.prescriptions FOR SELECT USING (has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "Pharmacists can update prescription status" ON public.prescriptions FOR UPDATE USING (has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = prescriptions.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for nursing_notes
CREATE POLICY "Admins can view nursing notes" ON public.nursing_notes FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Hospital doctors can view nursing notes" ON public.nursing_notes FOR SELECT USING (has_role(auth.uid(), 'hospital_doctor'));
CREATE POLICY "Nurses can manage nursing notes" ON public.nursing_notes FOR ALL USING (has_role(auth.uid(), 'nurse'));

-- RLS Policies for pharmacy_orders
CREATE POLICY "Admins can view all pharmacy orders" ON public.pharmacy_orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Pharmacists can manage pharmacy orders" ON public.pharmacy_orders FOR ALL USING (has_role(auth.uid(), 'pharmacist'));
CREATE POLICY "Patients can view own pharmacy orders" ON public.pharmacy_orders FOR SELECT USING (EXISTS (SELECT 1 FROM prescriptions p JOIN patients pt ON p.patient_id = pt.id WHERE p.id = pharmacy_orders.prescription_id AND pt.user_id = auth.uid()));

-- RLS Policies for sos_alerts
CREATE POLICY "Admins can manage SOS alerts" ON public.sos_alerts FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Hospital doctors can view and respond to SOS" ON public.sos_alerts FOR ALL USING (has_role(auth.uid(), 'hospital_doctor'));
CREATE POLICY "Nurses can view and respond to SOS" ON public.sos_alerts FOR ALL USING (has_role(auth.uid(), 'nurse'));
CREATE POLICY "Patients can view own SOS" ON public.sos_alerts FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = sos_alerts.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Patients can create SOS alerts" ON public.sos_alerts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM patients WHERE patients.id = sos_alerts.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for billing
CREATE POLICY "Admins can manage all billing" ON public.billing FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors can view billing for their consultations" ON public.billing FOR SELECT USING (EXISTS (SELECT 1 FROM consultations c JOIN profiles p ON c.doctor_id = p.id WHERE c.id = billing.consultation_id AND p.user_id = auth.uid()));
CREATE POLICY "Patients can view own bills" ON public.billing FOR SELECT USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = billing.patient_id AND patients.user_id = auth.uid()));
CREATE POLICY "Patients can update own bills" ON public.billing FOR UPDATE USING (EXISTS (SELECT 1 FROM patients WHERE patients.id = billing.patient_id AND patients.user_id = auth.uid()));

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to support new roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient');
  
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    user_role
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  IF user_role IN ('hospital_doctor', 'online_doctor') THEN
    INSERT INTO public.doctor_profiles (user_id, doctor_type)
    VALUES (NEW.id, user_role::text);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;