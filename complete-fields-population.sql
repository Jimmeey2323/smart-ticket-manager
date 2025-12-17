-- Complete Dynamic Fields Population Script
-- This script adds ALL remaining dynamic fields from the CSV file
-- Execute this AFTER the main schema and data insertion scripts

-- ============================================================================
-- BOOKING & TECHNOLOGY FIELDS (Continued)
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Waitlist Issues
('BT-WAIT-001', 'Class', 'Which class waitlist', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-WAIT'), true, false, 1, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express']),
('BT-WAIT-002', 'Instructor', 'Instructor name', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-WAIT'), true, false, 2, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3']),
('BT-WAIT-003', 'Class Date & Time', 'Class date and time', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-WAIT'), true, false, 3, NULL),
('BT-WAIT-004', 'Issue Type', 'Specific waitlist problem', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-WAIT'), true, false, 4, ARRAY['Not Moving from Waitlist', 'Waitlist Not Showing', 'Priority Confusion', 'Spot Available But Not Notified', 'Other']),
('BT-WAIT-005', 'Waitlist Position', 'Client''s position on waitlist', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-WAIT'), false, false, 5, NULL),

-- Cancellation Problems
('BT-CANC-001', 'Class to Cancel', 'Which class they tried to cancel', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 1, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express']),
('BT-CANC-002', 'Instructor', 'Instructor name', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 2, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3']),
('BT-CANC-003', 'Class Date & Time', 'Scheduled class time', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 3, NULL),
('BT-CANC-004', 'Cancellation Attempt Time', 'When they tried to cancel', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 4, NULL),
('BT-CANC-005', 'Hours Before Class', 'Time gap between cancellation attempt and class', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 5, NULL),
('BT-CANC-006', 'Issue Type', 'Type of cancellation issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CANC'), true, false, 6, ARRAY['Unable to Cancel via App', 'Late Cancellation Fee Charged', 'Cancellation Window Unclear', 'Credits Not Returned', 'Other']),

-- Class Check-in
('BT-CHKIN-001', 'Class', 'Which class', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CHKIN'), true, false, 1, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express']),
('BT-CHKIN-002', 'Instructor', 'Instructor name', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CHKIN'), true, false, 2, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3']),
('BT-CHKIN-003', 'Class Date & Time', 'Class date and time', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CHKIN'), true, false, 3, NULL),
('BT-CHKIN-004', 'Issue Type', 'Check-in problem type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CHKIN'), true, false, 4, ARRAY['QR Code Not Working', 'QR Code Not Scanning', 'Manual Check-in Delayed', 'Attendance Not Recorded', 'Check-in System Down', 'Other']),
('BT-CHKIN-005', 'Check-in Method Attempted', 'How they tried to check in', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-CHKIN'), true, false, 5, ARRAY['QR Code Scan', 'Manual by Staff', 'Self Check-in Kiosk', 'Other']),

-- Notifications
('BT-NOTIF-001', 'Issue Type', 'Type of notification issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-NOTIF'), true, false, 1, ARRAY['Missing Class Reminder', 'Missing Cancellation Confirmation', 'Too Many Notifications', 'Wrong Information in Notification', 'Notification Delay', 'Other']),
('BT-NOTIF-002', 'Notification Type', 'Which notification channel', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-NOTIF'), true, false, 2, ARRAY['Email', 'SMS', 'Push Notification', 'In-App', 'All Channels']),
('BT-NOTIF-003', 'Related Class', 'If related to specific class', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-NOTIF'), false, false, 3, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express']),

-- Profile Management
('BT-PROF-001', 'Issue Type', 'Profile issue type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PROF'), true, false, 1, ARRAY['Cannot Update Profile', 'Incorrect Information Displayed', 'Cannot Upload Photo', 'Cannot Change Password', 'Cannot Update Preferences', 'Other']),
('BT-PROF-002', 'Field Affected', 'Which profile field has issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PROF'), true, false, 2, ARRAY['Name', 'Email', 'Phone', 'Address', 'Emergency Contact', 'Photo', 'Payment Method', 'Preferences', 'Other']),
('BT-PROF-003', 'Platform', 'Where they tried to update', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PROF'), true, false, 3, ARRAY['iOS App', 'Android App', 'Website (Desktop)', 'Website (Mobile)']),

-- Class Visibility
('BT-VIS-001', 'Issue Type', 'Visibility issue type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-VIS'), true, false, 1, ARRAY['Favorite Instructor Not Showing', 'Schedule Not Updating', 'Wrong Studio Display', 'Missing Classes', 'Incorrect Times Displayed', 'Other']),
('BT-VIS-002', 'Affected Instructor', 'If specific to instructor', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-VIS'), false, false, 2, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3']),
('BT-VIS-003', 'Affected Studio', 'If specific to location', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-VIS'), false, false, 3, ARRAY['Kwality House Kemps Corner', 'Kenkre House', 'South United Football Club']),

-- Technical Support
('BT-TECH-001', 'Support Channel Used', 'How client contacted tech support', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-TECH'), true, false, 1, ARRAY['Email', 'Phone', 'In-App Chat', 'Social Media DM', 'Walk-in']),
('BT-TECH-002', 'Issue Reported to Support', 'What issue they reported', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-TECH'), true, false, 2, NULL),
('BT-TECH-003', 'Response Time', 'How quickly support responded', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-TECH'), true, false, 3, ARRAY['Immediate', 'Within 1 Hour', 'Within 24 Hours', '24-48 Hours', 'No Response Yet', 'Other'])

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- CUSTOMER SERVICE FIELDS (Continued)
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Response Time
('CS-RESP-001', 'Communication Channel', 'How client was supposed to be contacted', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESP'), true, false, 1, ARRAY['Email', 'Phone Call', 'WhatsApp', 'Social Media DM', 'In-Person Follow-up Promised']),
('CS-RESP-002', 'Initial Contact Date', 'When client first reached out', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESP'), true, false, 2, NULL),
('CS-RESP-003', 'Issue Reported', 'What they were contacting about', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESP'), true, false, 3, NULL),
('CS-RESP-004', 'Response Received', 'Did they get a response', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESP'), true, false, 4, ARRAY['Yes - Late', 'No Response Yet', 'Partial Response']),

-- Issue Resolution
('CS-RESOL-001', 'Original Issue', 'What was the original complaint', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESOL'), true, false, 1, NULL),
('CS-RESOL-002', 'Date First Reported', 'When was it first reported', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESOL'), true, false, 2, NULL),
('CS-RESOL-003', 'Issue Type', 'Resolution problem type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESOL'), true, false, 3, ARRAY['Still Unresolved', 'Passed Between Departments', 'No Clear Owner', 'Resolution Inadequate', 'Other']),
('CS-RESOL-004', 'Departments Involved', 'Which teams have handled this', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESOL'), false, false, 4, ARRAY['Operations', 'Facilities', 'Training', 'Sales', 'Client Success', 'Marketing', 'Finance']),
('CS-RESOL-005', 'Number of Contacts', 'How many times client has followed up', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-RESOL'), false, false, 5, NULL),

-- Communication Quality
('CS-COMM-001', 'Issue Type', 'Communication problem type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMM'), true, false, 1, ARRAY['Poor Communication', 'Language Barrier', 'Unclear Information', 'Conflicting Information', 'Tone Issues', 'Other']),
('CS-COMM-002', 'Communication Channel', 'How communication happened', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMM'), true, false, 2, ARRAY['In-Person', 'Phone', 'Email', 'WhatsApp', 'Social Media']),
('CS-COMM-003', 'Staff Member Involved', 'Who communicated with client', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMM'), false, false, 3, ARRAY['Staff Member 1', 'Staff Member 2', 'Manager']),
('CS-COMM-004', 'Language Issue', 'If language was a barrier', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMM'), false, false, 4, ARRAY['English', 'Hindi', 'Other', 'None']),

-- Staff Knowledge
('CS-KNOW-001', 'Staff Member', 'Which staff member', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-KNOW'), false, false, 1, ARRAY['Staff Member 1', 'Staff Member 2', 'Manager']),
('CS-KNOW-002', 'Knowledge Gap Area', 'What they didn''t know', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-KNOW'), true, false, 2, ARRAY['Class Details', 'Membership Packages', 'Billing/Credits', 'Studio Policies', 'Instructor Schedules', 'Special Programs', 'Other']),
('CS-KNOW-003', 'Client Query', 'What was the client''s question', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-KNOW'), true, false, 3, NULL),
('CS-KNOW-004', 'Incorrect Information Given', 'Did staff give wrong info', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-KNOW'), true, false, 4, NULL),

-- Staff Availability
('CS-AVAIL-001', 'Issue Type', 'Availability issue type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-AVAIL'), true, false, 1, ARRAY['No One at Desk', 'Long Wait Time', 'Understaffed', 'Staff Busy with Other Tasks', 'Other']),
('CS-AVAIL-002', 'Time of Day', 'When did this occur', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-AVAIL'), true, false, 2, ARRAY['Morning (6-10am)', 'Midday (10am-2pm)', 'Afternoon (2-6pm)', 'Evening (6-10pm)']),
('CS-AVAIL-003', 'Wait Time', 'How long client waited', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-AVAIL'), false, false, 3, ARRAY['Under 5 min', '5-10 min', '10-15 min', '15+ min']),

-- Complaint Handling
('CS-COMPL-001', 'Original Complaint Category', 'What was the complaint about', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMPL'), true, false, 1, ARRAY['Service Quality', 'Facility Issues', 'Billing Problems', 'Class Experience', 'Staff Behavior', 'Other']),
('CS-COMPL-002', 'Issue Type', 'How complaint was mishandled', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMPL'), true, false, 2, ARRAY['Dismissive Attitude', 'Defensive Response', 'No Escalation Option', 'Not Taken Seriously', 'Other']),
('CS-COMPL-003', 'Staff Member Who Received Complaint', 'Who client complained to', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-COMPL'), false, false, 3, ARRAY['Staff Member 1', 'Staff Member 2', 'Manager']),

-- Phone Support
('CS-PHONE-001', 'Phone Number Called', 'Which number they called', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PHONE'), true, false, 1, ARRAY['Main Reception', 'Booking Line', 'Member Services', 'Emergency Line']),
('CS-PHONE-002', 'Issue Type', 'Phone support issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PHONE'), true, false, 2, ARRAY['No Answer', 'Long Hold Time', 'Call Disconnected', 'No Callback', 'Wrong Extension', 'Other']),
('CS-PHONE-003', 'Time of Call', 'When they called', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PHONE'), true, false, 3, NULL),

-- Email/Chat Support
('CS-EMAIL-001', 'Channel', 'Which channel used', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-EMAIL'), true, false, 1, ARRAY['Email', 'In-App Chat', 'WhatsApp', 'Website Chat']),
('CS-EMAIL-002', 'Issue Type', 'Support issue type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-EMAIL'), true, false, 2, ARRAY['Slow Response', 'Generic Reply', 'Issue Not Resolved', 'Auto-Reply Only', 'Other']),
('CS-EMAIL-003', 'Date Sent', 'When client sent message', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-EMAIL'), true, false, 3, NULL),

-- Staff Professionalism
('CS-PROF-001', 'Staff Member', 'Which staff member', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PROF'), false, false, 1, ARRAY['Staff Member 1', 'Staff Member 2', 'Manager']),
('CS-PROF-002', 'Issue Type', 'Professional conduct issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PROF'), true, false, 2, ARRAY['Gossiping', 'Using Personal Phone', 'Eating at Desk', 'Inappropriate Conversation', 'Unprofessional Attire', 'Other']),
('CS-PROF-003', 'Incident Details', 'What happened', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-PROF'), true, false, 3, NULL),

-- Newcomer Experience
('CS-NEW-001', 'Client''s First Visit Date', 'When was their first class', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-NEW'), true, false, 1, NULL),
('CS-NEW-002', 'Issue Type', 'Onboarding issue type', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-NEW'), true, false, 2, ARRAY['No Orientation', 'Poor Onboarding', 'Lack of Guidance', 'Not Welcomed', 'Studio Tour Missing', 'Other']),
('CS-NEW-003', 'Staff Who Greeted', 'Who welcomed them', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-NEW'), false, false, 3, ARRAY['Staff Member 1', 'Staff Member 2', 'Manager'])

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- SALES & MARKETING FIELDS
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Misleading Information
('SM-MISL-001', 'Sales Staff Member', 'Who did the sales pitch', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), false, false, 1, ARRAY['Sales Rep 1', 'Sales Rep 2', 'Manager']),
('SM-MISL-002', 'Issue Type', 'Type of misleading info', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), true, false, 2, ARRAY['False Promise', 'Exaggerated Benefits', 'Hidden Terms', 'Pressure Tactics', 'Incorrect Package Info', 'Other']),
('SM-MISL-003', 'What Was Promised', 'What client was told', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), true, false, 3, NULL),
('SM-MISL-004', 'What Was Actually True', 'What the reality is', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), true, false, 4, NULL),
('SM-MISL-005', 'Package/Product Sold', 'What package was purchased', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), true, false, 5, ARRAY['10 Class Package', '20 Class Package', 'Monthly Unlimited', 'Annual Membership']),
('SM-MISL-006', 'Sale Date', 'When purchase was made', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-MISL'), true, false, 6, NULL),

-- Aggressive Selling
('SM-AGG-001', 'Sales Staff Member', 'Who contacted client', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-AGG'), false, false, 1, ARRAY['Sales Rep 1', 'Sales Rep 2', 'Manager']),
('SM-AGG-002', 'Issue Type', 'Type of aggressive selling', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-AGG'), true, false, 2, ARRAY['Excessive Follow-ups', 'Pressure to Upgrade', 'Unwanted Sales Calls', 'Sales During Class Time', 'Hard Sell Tactics', 'Other']),
('SM-AGG-003', 'Contact Method', 'How client was contacted', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-AGG'), true, false, 3, ARRAY['Phone Calls', 'WhatsApp', 'Email', 'In-Person', 'SMS']),
('SM-AGG-004', 'Frequency', 'How often contacted', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-AGG'), false, false, 4, ARRAY['Daily', 'Multiple Times Daily', 'Weekly', 'After Each Class', 'Other']),

-- Trial Class Experience
('SM-TRIAL-001', 'Trial Class Date', 'When was trial class', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-TRIAL'), true, false, 1, NULL),
('SM-TRIAL-002', 'Class Attended', 'Which class', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-TRIAL'), true, false, 2, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express']),
('SM-TRIAL-003', 'Instructor', 'Who taught', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'SM'), (SELECT id FROM "subcategories" WHERE code = 'SM-TRIAL'), true, false, 3, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3'])

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- HEALTH & SAFETY FIELDS
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Equipment Safety
('HS-EQUIP-001', 'Equipment Type', 'What equipment had issues', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-EQUIP'), true, false, 1, ARRAY['Barre', 'Weights', 'Resistance Bands', 'Ball', 'Platform', 'Sound System', 'Other']),
('HS-EQUIP-002', 'Equipment ID/Location', 'Specific equipment identifier', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-EQUIP'), false, false, 2, NULL),
('HS-EQUIP-003', 'Issue Type', 'Type of equipment issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-EQUIP'), true, false, 3, ARRAY['Broken/Damaged', 'Unstable', 'Sharp Edges', 'Electrical Issue', 'Hygiene Issue', 'Missing Parts', 'Other']),
('HS-EQUIP-004', 'Injury Resulted', 'Did anyone get injured', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-EQUIP'), true, false, 4, NULL),
('HS-EQUIP-005', 'Equipment Removed/Fixed', 'Was equipment taken out of service', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-EQUIP'), true, false, 5, NULL),

-- Injury During Class
('HS-INJURY-001', 'Injured Person Type', 'Who was injured', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 1, ARRAY['Member', 'Guest', 'Staff', 'Instructor']),
('HS-INJURY-002', 'Class Type', 'Which class was occurring', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 2, ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express', 'Private Session']),
('HS-INJURY-003', 'Instructor Present', 'Which instructor was teaching', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 3, ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3']),
('HS-INJURY-004', 'Injury Type', 'Nature of injury', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 4, ARRAY['Muscle Strain', 'Joint Pain', 'Fall', 'Cut/Scrape', 'Bruise', 'Sprain', 'Other']),
('HS-INJURY-005', 'Body Part Affected', 'Where was the injury', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 5, ARRAY['Back', 'Shoulder', 'Knee', 'Ankle', 'Wrist', 'Neck', 'Hip', 'Other']),
('HS-INJURY-006', 'Medical Attention Required', 'Was medical help needed', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-INJURY'), true, false, 6, ARRAY['No', 'First Aid Only', 'Doctor Visit Required', 'Emergency Room', 'Ambulance Called']),

-- Hygiene Protocols
('HS-HYGIENE-001', 'Area Affected', 'Which area had hygiene issues', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-HYGIENE'), true, false, 1, ARRAY['Studio Floor', 'Bathroom', 'Changing Room', 'Equipment', 'Water Station', 'Reception Area', 'Other']),
('HS-HYGIENE-002', 'Issue Type', 'Type of hygiene problem', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-HYGIENE'), true, false, 2, ARRAY['Unclean Surfaces', 'Bad Odor', 'Inadequate Cleaning', 'No Sanitizer Available', 'Pest Problem', 'Overflowing Trash', 'Other']),
('HS-HYGIENE-003', 'Time Observed', 'When was this noticed', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-HYGIENE'), true, false, 3, NULL),
('HS-HYGIENE-004', 'Immediate Action Taken', 'Was area cleaned/addressed immediately', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'HS'), (SELECT id FROM "subcategories" WHERE code = 'HS-HYGIENE'), true, false, 4, NULL)

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- RETAIL & MERCHANDISE FIELDS
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Product Quality
('RM-QUALITY-001', 'Product Category', 'Type of product', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-QUALITY'), true, false, 1, ARRAY['Apparel', 'Equipment', 'Accessories', 'Nutrition/Supplements', 'Gift Cards', 'Other']),
('RM-QUALITY-002', 'Product Name', 'Specific product name', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-QUALITY'), true, false, 2, NULL),
('RM-QUALITY-003', 'Quality Issue', 'What was wrong with product', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-QUALITY'), true, false, 3, ARRAY['Defective', 'Poor Material', 'Wrong Size', 'Damaged Packaging', 'Expired', 'Not as Described', 'Other']),
('RM-QUALITY-004', 'Purchase Date', 'When was product bought', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-QUALITY'), true, false, 4, NULL),
('RM-QUALITY-005', 'Receipt Available', 'Does client have receipt', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-QUALITY'), false, false, 5, NULL),

-- Product Availability
('RM-AVAIL-001', 'Product Requested', 'What product was needed', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-AVAIL'), true, false, 1, NULL),
('RM-AVAIL-002', 'Size/Variant Needed', 'Specific size or variant', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-AVAIL'), false, false, 2, NULL),
('RM-AVAIL-003', 'Expected Restock Date', 'When will item be available', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-AVAIL'), false, false, 3, NULL),
('RM-AVAIL-004', 'Alternative Suggested', 'Was substitute offered', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-AVAIL'), false, false, 4, NULL),

-- Pricing
('RM-PRICE-001', 'Product/Service', 'What had pricing issue', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-PRICE'), true, false, 1, NULL),
('RM-PRICE-002', 'Issue Type', 'Type of pricing problem', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-PRICE'), true, false, 2, ARRAY['Price Different Than Advertised', 'Hidden Fees', 'Discount Not Applied', 'Tax Confusion', 'Price Change Without Notice', 'Other']),
('RM-PRICE-003', 'Expected Price', 'What client thought price would be', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-PRICE'), false, false, 3, NULL),
('RM-PRICE-004', 'Actual Price', 'What was actually charged', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-PRICE'), false, false, 4, NULL),

-- Return/Exchange
('RM-RETURN-001', 'Product to Return', 'What product needs return/exchange', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-RETURN'), true, false, 1, NULL),
('RM-RETURN-002', 'Reason for Return', 'Why return is needed', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-RETURN'), true, false, 2, ARRAY['Defective', 'Wrong Size', 'Changed Mind', 'Not as Expected', 'Damaged in Transit', 'Other']),
('RM-RETURN-003', 'Days Since Purchase', 'How long ago was it bought', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-RETURN'), false, false, 3, NULL),
('RM-RETURN-004', 'Condition of Item', 'State of returned item', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-RETURN'), true, false, 4, ARRAY['New with Tags', 'Good Condition', 'Minor Wear', 'Significant Wear', 'Damaged']),

-- Staff Knowledge (Retail)
('RM-KNOW-001', 'Staff Member', 'Who lacked product knowledge', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-KNOW'), false, false, 1, ARRAY['Sales Associate 1', 'Sales Associate 2', 'Manager']),
('RM-KNOW-002', 'Product Category', 'What product area', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-KNOW'), true, false, 2, ARRAY['Apparel', 'Equipment', 'Accessories', 'Nutrition/Supplements', 'Pricing', 'Policies']),
('RM-KNOW-003', 'Specific Question', 'What did client ask about', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-KNOW'), true, false, 3, NULL),
('RM-KNOW-004', 'Impact on Sale', 'Did this affect purchase decision', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'RM'), (SELECT id FROM "subcategories" WHERE code = 'RM-KNOW'), false, false, 4, ARRAY['No Impact', 'Customer Left Without Buying', 'Bought Different Item', 'Will Come Back Later'])

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- MISCELLANEOUS FIELDS
-- ============================================================================

INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Lost & Found
('MISC-LST-001', 'Issue Type', 'Type of lost & found issue', (SELECT id FROM "fieldTypes" WHERE name = 'Radio Button'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-LOST'), true, false, 1, ARRAY['Item lost', 'Item found', 'Item claimed', 'System issue']),
('MISC-LST-002', 'Item Description', 'What is the item', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-LOST'), true, false, 2, NULL),
('MISC-LST-003', 'Item Category', 'Type of item', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-LOST'), true, false, 3, ARRAY['Clothing', 'Jewelry', 'Phone/electronics', 'Keys', 'Wallet/purse', 'Water bottle', 'Workout equipment', 'Other']),
('MISC-LST-004', 'Date Lost/Found', 'When item was lost or found', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-LOST'), true, false, 4, NULL),
('MISC-LST-005', 'Location in Studio', 'Where item was lost/found', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-LOST'), false, false, 5, NULL),

-- Guest Experience
('MISC-GST-001', 'Guest Type', 'Type of guest', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-GUEST'), true, false, 1, ARRAY['First-time visitor', 'Referred by member', 'Corporate guest', 'Event attendee', 'Other']),
('MISC-GST-002', 'Date of Visit', 'When did guest visit', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-GUEST'), true, false, 2, NULL),
('MISC-GST-003', 'Class/Service Experienced', 'What did guest do', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-GUEST'), false, false, 3, ARRAY['Trial Class', 'Studio Tour', 'Consultation', 'Event', 'Other']),
('MISC-GST-004', 'Issue Type', 'What was problematic', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-GUEST'), true, false, 4, ARRAY['Unwelcoming treatment', 'Complicated check-in process', 'Unclear policies', 'Different pricing than expected', 'Not given proper orientation', 'Felt rushed', 'Felt judged', 'Other']),
('MISC-GST-005', 'Staff Member Involved', 'Who interacted with guest', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-GUEST'), false, false, 5, ARRAY['Front Desk Staff', 'Sales Team', 'Instructor', 'Manager']),

-- Nutrition/Wellness Advice
('MISC-NUT-001', 'Issue Type', 'What nutrition/wellness issue occurred', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-NUTRITION'), true, false, 1, ARRAY['Unqualified advice given', 'Conflicting information from different staff', 'Pushy supplement sales', 'Medical advice given inappropriately', 'Dietary restrictions ignored', 'Unsafe recommendations', 'Other']),
('MISC-NUT-002', 'Staff Member/Trainer', 'Who gave the advice', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-NUTRITION'), true, false, 2, ARRAY['Instructor 1', 'Instructor 2', 'Trainer 1', 'Front Desk Staff', 'Other']),
('MISC-NUT-003', 'Topic of Advice', 'What was advice about', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-NUTRITION'), true, false, 3, ARRAY['Supplements', 'Diet/meal plans', 'Weight loss', 'Medical condition', 'Injury recovery', 'Performance enhancement', 'General wellness', 'Other']),
('MISC-NUT-004', 'Advice Given', 'What was said', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-NUTRITION'), true, false, 4, NULL),

-- Multi-location Issues
('MISC-MLT-001', 'Issue Type', 'What multi-location problem exists', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-MULTI'), true, false, 1, ARRAY['Credits not transferring', 'Package not valid at all locations', 'Different policies across studios', 'Booking confusion', 'Inconsistent pricing', 'Different class offerings', 'Technology/system issues', 'Staff gave conflicting info', 'Other']),
('MISC-MLT-002', 'Locations Involved', 'Which studios are involved', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-MULTI'), true, false, 2, ARRAY['Kwality House Kemps Corner', 'Kenkre House', 'South United Football Club', 'Supreme HQ Bandra', 'WeWork Prestige Central', 'WeWork Galaxy', 'The Studio by Copper + Cloves']),
('MISC-MLT-003', 'Package/Product Type', 'What package/product', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-MULTI'), true, false, 3, ARRAY['10 Class Package', '20 Class Package', 'Monthly Unlimited', 'Annual Membership', 'Corporate Package']),
('MISC-MLT-004', 'Detailed Issue Description', 'Complete description', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-MULTI'), true, false, 4, NULL),

-- Feedback System
('MISC-FDB-001', 'Feedback System Issue', 'What feedback system problem exists', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-FEEDBACK'), true, false, 1, ARRAY['No way to provide feedback', 'Feedback form not working', 'Feedback not acknowledged', 'No response received', 'Response took too long', 'Dismissive response', 'Retaliation for negative feedback', 'Fear of retaliation', 'Other']),
('MISC-FDB-002', 'Feedback Channel Used', 'How did client try to give feedback', (SELECT id FROM "fieldTypes" WHERE name = 'Multi-select'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-FEEDBACK'), true, false, 2, ARRAY['In-person to staff', 'Email', 'Phone', 'Survey', 'Social media', 'Third-party review site', 'This ticketing system', 'Other']),
('MISC-FDB-003', 'Original Feedback Topic', 'What was feedback about', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-FEEDBACK'), true, false, 3, ARRAY['Trainer', 'Class experience', 'Facilities', 'Billing', 'Customer service', 'Product/retail', 'Policy', 'Other']),
('MISC-FDB-004', 'Original Feedback Date', 'When did client provide feedback', (SELECT id FROM "fieldTypes" WHERE name = 'Date'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-FEEDBACK'), false, false, 4, NULL),
('MISC-FDB-005', 'Response Received', 'Was feedback acknowledged', (SELECT id FROM "fieldTypes" WHERE name = 'Radio Button'), (SELECT id FROM "categories" WHERE code = 'MISC'), (SELECT id FROM "subcategories" WHERE code = 'MISC-FEEDBACK'), true, false, 5, ARRAY['Yes', 'No'])

ON CONFLICT (uniqueId) DO NOTHING;

-- ============================================================================
-- FINAL UPDATE: Set validation rules for specific field types
-- ============================================================================

-- Update validation rules for specific fields
UPDATE "dynamicFields" 
SET validationRules = '{"required": true, "minLength": 3, "maxLength": 255}'
WHERE fieldTypeId = (SELECT id FROM "fieldTypes" WHERE name = 'Text') AND isRequired = true;

UPDATE "dynamicFields" 
SET validationRules = '{"required": true, "minLength": 10, "maxLength": 2000}'
WHERE fieldTypeId = (SELECT id FROM "fieldTypes" WHERE name = 'Long Text') AND isRequired = true;

UPDATE "dynamicFields" 
SET validationRules = '{"required": true, "pattern": "^[^@]+@[^@]+\\.[^@]+$"}'
WHERE fieldTypeId = (SELECT id FROM "fieldTypes" WHERE name = 'Email');

UPDATE "dynamicFields" 
SET validationRules = '{"required": true, "min": 0}'
WHERE fieldTypeId = (SELECT id FROM "fieldTypes" WHERE name = 'Number') AND isRequired = true;

UPDATE "dynamicFields" 
SET validationRules = '{"required": true}'
WHERE fieldTypeId = (SELECT id FROM "fieldTypes" WHERE name = 'DateTime') AND isRequired = true;

-- Success message
SELECT 
    'All dynamic fields populated successfully!' as message,
    'Total fields created: ' || (SELECT COUNT(*) FROM "dynamicFields") as total_fields,
    'Booking & Technology fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'BT') as bt_fields,
    'Customer Service fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'CS') as cs_fields,
    'Sales & Marketing fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'SM') as sm_fields,
    'Health & Safety fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'HS') as hs_fields,
    'Retail & Merchandise fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'RM') as rm_fields,
    'Miscellaneous fields: ' || (SELECT COUNT(*) FROM "dynamicFields" df JOIN "categories" c ON df."categoryId" = c.id WHERE c.code = 'MISC') as misc_fields;