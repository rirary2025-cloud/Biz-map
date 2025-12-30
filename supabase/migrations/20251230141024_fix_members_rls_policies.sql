/*
  # Fix Members RLS Policies for Map Display

  1. Changes
    - Drop existing restrictive SELECT policies on members table
    - Add new policy allowing authenticated users to view visible members based on public_level
    - Add policy for unauthenticated users to view general_public members
    
  2. Security
    - Authenticated users can see members where:
      * visible = true
      * public_level allows access based on user's authentication status
    - Unauthenticated users can only see members with general_public = true
    - Members can still update only their own records
    - Admins maintain full access
*/

DROP POLICY IF EXISTS "Members can view their own record" ON members;
DROP POLICY IF EXISTS "Admin can view all members" ON members;

CREATE POLICY "Anyone can view general public members"
  ON members FOR SELECT
  USING (visible = true AND general_public = true);

CREATE POLICY "Authenticated users can view member-level members"
  ON members FOR SELECT
  TO authenticated
  USING (visible = true AND public_level >= 2);

CREATE POLICY "Authenticated users can view full info members"
  ON members FOR SELECT
  TO authenticated
  USING (visible = true AND public_level >= 3);

CREATE POLICY "Members can view own record"
  ON members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all members"
  ON members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members AS m
      WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );
