-- ShramSetu Seed Data

-- Services
INSERT INTO services (name, category, base_price, description, icon) VALUES
('Electrical Repair', 'Electrical', 299, 'Fix wiring, switches, fans, and electrical faults', '⚡'),
('AC Service & Repair', 'Electrical', 599, 'AC installation, cleaning, gas refill, and repair', '❄️'),
('Plumbing Repair', 'Plumbing', 249, 'Pipe leak, tap repair, drainage cleaning', '🔧'),
('Bathroom Fitting', 'Plumbing', 799, 'Shower, toilet, and complete bathroom fitting', '🚿'),
('House Painting', 'Painting', 1499, 'Interior and exterior painting with quality finish', '🎨'),
('Wall Putty & POP', 'Painting', 999, 'Smooth wall finishing and POP false ceiling', '🏠'),
('Carpentry Work', 'Carpentry', 399, 'Door/window repair, furniture fixing, custom wood work', '🪚'),
('Furniture Assembly', 'Carpentry', 299, 'Assemble flat-pack furniture from any brand', '🛋️'),
('Deep Home Cleaning', 'Cleaning', 1299, 'Full home deep cleaning including kitchen and bathrooms', '🧹'),
('Sofa & Carpet Cleaning', 'Cleaning', 499, 'Professional steam cleaning of sofas and carpets', '🛁'),
('CCTV Installation', 'Security', 799, 'Install security cameras and configure DVR', '📹'),
('Pest Control', 'Pest Control', 899, 'Cockroach, termite, rat, and bed bug treatment', '🐛'),
('Water Purifier Service', 'Appliance', 399, 'RO water purifier service and filter change', '💧'),
('Washing Machine Repair', 'Appliance', 449, 'Repair all brands of washing machines', '🫧'),
('Refrigerator Repair', 'Appliance', 499, 'Fridge cooling, compressor and gas issues', '🧊'),
('Tailoring & Stitching', 'Tailoring', 199, 'Dress stitching, alteration, and repairs', '🧵')
ON CONFLICT DO NOTHING;

-- Demo Users (password: Test@1234)
INSERT INTO users (id, name, phone, email, password_hash, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Rahul Sharma', '9876543210', 'rahul@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client'),
('22222222-2222-2222-2222-222222222222', 'Manoj Kumar', '9123456780', 'manoj@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
('33333333-3333-3333-3333-333333333333', 'Ramesh Patel', '9988776655', 'ramesh@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
('44444444-4444-4444-4444-444444444444', 'Suresh Yadav', '9871234560', 'suresh@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
('55555555-5555-5555-5555-555555555555', 'Priya Singh', '9765432100', 'priya@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
('66666666-6666-6666-6666-666666666666', 'Deepak Verma', '9654321098', 'deepak@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'worker'),
('77777777-7777-7777-7777-777777777777', 'Anjali Mehta', '9543210987', 'anjali@demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client')
ON CONFLICT DO NOTHING;

-- Worker Profiles
INSERT INTO workers (id, user_id, skills, experience, bio, location, pricing, verification_status) VALUES
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
 ARRAY['Electrical Repair', 'AC Service & Repair', 'CCTV Installation'],
 8, 'Senior electrician with 8 years of experience. ITI certified. Available 7 days a week.',
 'Delhi, Lajpat Nagar',
 '{"Electrical Repair": 350, "AC Service & Repair": 650, "CCTV Installation": 900}'::jsonb,
 'verified'),

('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaab', '33333333-3333-3333-3333-333333333333',
 ARRAY['Plumbing Repair', 'Bathroom Fitting'],
 6, 'Expert plumber handling all plumbing issues quickly and cleanly. 6 years in Delhi NCR.',
 'Delhi, Dwarka',
 '{"Plumbing Repair": 299, "Bathroom Fitting": 850}'::jsonb,
 'verified'),

('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaac', '44444444-4444-4444-4444-444444444444',
 ARRAY['House Painting', 'Wall Putty & POP'],
 10, 'Master painter with 10 years experience. Specialise in interior design and texture painting.',
 'Mumbai, Andheri',
 '{"House Painting": 1799, "Wall Putty & POP": 1099}'::jsonb,
 'verified'),

('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaad', '55555555-5555-5555-5555-555555555555',
 ARRAY['Deep Home Cleaning', 'Sofa & Carpet Cleaning'],
 4, 'Professional cleaner trained in hygiene standards. Uses eco-friendly products. 4 years experience.',
 'Bangalore, Koramangala',
 '{"Deep Home Cleaning": 1399, "Sofa & Carpet Cleaning": 549}'::jsonb,
 'verified'),

('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaae', '66666666-6666-6666-6666-666666666666',
 ARRAY['Carpentry Work', 'Furniture Assembly', 'Washing Machine Repair'],
 5, 'Multi-skilled technician handling carpentry and appliance repairs. Quick response time.',
 'Hyderabad, Madhapur',
 '{"Carpentry Work": 450, "Furniture Assembly": 349, "Washing Machine Repair": 499}'::jsonb,
 'verified')
ON CONFLICT DO NOTHING;

-- Reviews
INSERT INTO reviews (user_id, worker_id, rating, comment) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Manoj was excellent! Fixed our wiring issue in under an hour. Very professional and clean work.'),
('77777777-7777-7777-7777-777777777777', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Installed 3 CCTV cameras perfectly. Explained how to use the app too. Highly recommended!'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaab', 4, 'Fixed the pipe leak quickly. Arrived on time. Will book again.'),
('77777777-7777-7777-7777-777777777777', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaac', 5, 'Suresh painted our entire living room beautifully. Premium finish and very reasonable price.'),
('11111111-1111-1111-1111-111111111111', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaad', 5, 'Priya and her team did a fantastic deep cleaning. My house feels brand new!'),
('77777777-7777-7777-7777-777777777777', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaae', 4, 'Deepak assembled our IKEA furniture quickly. Good work overall.')
ON CONFLICT DO NOTHING;
