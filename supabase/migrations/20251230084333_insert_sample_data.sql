/*
  # Insert Sample Data for Seisei Club Map

  Sample branches and demonstration data for the Hokkaido MVP
*/

INSERT INTO branches (name, region, city, latitude, longitude, founded_year, member_count, public, memo)
VALUES
  ('札幌支部', '北海道', '札幌市', 43.0642, 141.3469, 2010, 45, true, 'Main Hokkaido branch'),
  ('旭川支部', '北海道', '旭川市', 43.7697, 142.3625, 2012, 28, true, 'Northern branch'),
  ('釧路支部', '北海道', '釧路市', 42.9849, 144.3823, 2015, 18, true, 'Eastern branch'),
  ('函館支部', '北海道', '函館市', 41.7711, 140.7260, 2011, 32, true, 'Southern branch')
ON CONFLICT (id) DO NOTHING;