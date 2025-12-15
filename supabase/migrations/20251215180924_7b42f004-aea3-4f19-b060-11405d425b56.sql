-- Phase 1a: Expand app_role enum with new roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'hospital_doctor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'online_doctor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'nurse';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'pharmacist';