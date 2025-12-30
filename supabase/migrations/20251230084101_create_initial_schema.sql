/*
  # Seisei Club Business Map - Initial Schema

  1. New Tables
    - `branches` - 支部情報
      - `id` (uuid, primary key)
      - `name` (text) - 支部名
      - `region` (text) - エリア（都道府県）
      - `city` (text) - 市区町村
      - `latitude` (numeric) - 緯度
      - `longitude` (numeric) - 経度
      - `founded_year` (integer) - 開始年
      - `member_count` (integer) - 会員数
      - `public` (boolean) - 一般公開可否
      - `memo` (text) - 管理者メモ
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `members` - 会員情報
      - `id` (uuid, primary key)
      - `user_id` (uuid) - auth.users.id への参照
      - `branch_id` (uuid) - 支部への参照
      - `display_name` (text) - 表示名
      - `company_name` (text) - 会社名（任意）
      - `role` (enum: 'viewer', 'listed', 'admin') - ロール
      - `industry_1` (text) - 業種1
      - `industry_2` (text) - 業種2（任意）
      - `want_to_introduce` (text) - 紹介してほしい内容
      - `can_introduce` (text) - 紹介できる内容
      - `latitude` (numeric) - マップ上の緯度
      - `longitude` (numeric) - マップ上の経度
      - `visible` (boolean) - 表示/非表示
      - `public_level` (integer: 1,2,3) - 公開レベル
      - `general_public` (boolean) - 一般公開ON/OFF
      - `seisei_years` (integer) - 守成歴
      - `payment_status` (enum: 'active', 'inactive', 'cancelled') - 支払い状態
      - `last_updated_by` (enum: 'self', 'admin') - 最終更新者
      - `version` (integer) - 更新バージョン
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payment_records` - 支払い記録
      - `id` (uuid, primary key)
      - `member_id` (uuid) - 会員への参照
      - `amount` (integer) - 金額（円）
      - `status` (enum: 'pending', 'completed', 'failed') - ステータス
      - `payment_date` (timestamp) - 支払い日
      - `next_billing_date` (timestamp) - 次回請求日
      - `transaction_id` (text) - 外部決済ID
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `member_updates` - 会員更新履歴
      - `id` (uuid, primary key)
      - `member_id` (uuid) - 会員への参照
      - `changed_fields` (jsonb) - 変更されたフィールド
      - `updated_by` (enum: 'self', 'admin') - 更新者
      - `admin_reason` (text) - 管理代行の理由
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for viewer/listed/admin roles
*/

CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region text NOT NULL,
  city text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  founded_year integer,
  member_count integer DEFAULT 0,
  public boolean DEFAULT true,
  memo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id),
  display_name text NOT NULL,
  company_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('viewer', 'listed', 'admin')),
  industry_1 text,
  industry_2 text,
  want_to_introduce text,
  can_introduce text,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  visible boolean DEFAULT false,
  public_level integer DEFAULT 1 CHECK (public_level IN (1, 2, 3)),
  general_public boolean DEFAULT false,
  seisei_years integer DEFAULT 0,
  payment_status text DEFAULT 'inactive' CHECK (payment_status IN ('active', 'inactive', 'cancelled')),
  last_updated_by text DEFAULT 'self' CHECK (last_updated_by IN ('self', 'admin')),
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, branch_id)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 5000,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_date timestamptz,
  next_billing_date timestamptz,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  changed_fields jsonb DEFAULT '{}'::jsonb,
  updated_by text DEFAULT 'self' CHECK (updated_by IN ('self', 'admin')),
  admin_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branches are viewable by everyone"
  ON branches FOR SELECT
  USING (true);

CREATE POLICY "Members can view their own record"
  ON members FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Members can update their own record"
  ON members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all members"
  ON members FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can update all members"
  ON members FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Members can insert their own record"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view their payment records"
  ON payment_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = payment_records.member_id
      AND members.user_id = auth.uid()
    )
    OR auth.jwt()->>'role' = 'admin'
  );

CREATE POLICY "Admin can view all payment records"
  ON payment_records FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Members can view their update history"
  ON member_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE members.id = member_updates.member_id
      AND members.user_id = auth.uid()
    )
    OR auth.jwt()->>'role' = 'admin'
  );
