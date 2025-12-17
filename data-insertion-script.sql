-- Comprehensive Data Insertion Script for Physique 57 India Ticket System
-- This script inserts all categories, subcategories, and dynamic fields based on the CSV data
-- Execute this AFTER running the main schema script

-- ============================================================================
-- SUBCATEGORIES INSERTION (Based on CSV data)
-- ============================================================================

INSERT INTO "subcategories" ("categoryId", "name", "description", "code", "defaultPriority", "slaHours") VALUES

-- Booking & Technology Subcategories
((SELECT id FROM "categories" WHERE code = 'BT'), 'App/Website Issues', 'Technical problems with mobile apps and website', 'BT-APP', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Booking Failures', 'Issues with class booking and reservations', 'BT-BOOK', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Waitlist Issues', 'Problems with class waitlist management', 'BT-WAIT', 'medium', 12),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Cancellation Problems', 'Issues with booking cancellations and refunds', 'BT-CANC', 'high', 8),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Class Check-in', 'QR code scanning and check-in issues', 'BT-CHKIN', 'medium', 2),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Notifications', 'Push notifications and communication issues', 'BT-NOTIF', 'low', 48),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Profile Management', 'User profile and account management issues', 'BT-PROF', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Class Visibility', 'Issues with class schedules and visibility', 'BT-VIS', 'medium', 12),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Payment Gateway', 'Payment processing and billing issues', 'BT-PAY', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'BT'), 'Technical Support', 'General technical support and assistance', 'BT-TECH', 'medium', 24),

-- Customer Service Subcategories
((SELECT id FROM "categories" WHERE code = 'CS'), 'Front Desk Service', 'Issues with front desk staff and service quality', 'CS-DESK', 'high', 2),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Response Time', 'Slow or inadequate response to customer inquiries', 'CS-RESP', 'high', 8),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Issue Resolution', 'Problems with resolving customer complaints', 'CS-RESOL', 'high', 12),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Communication Quality', 'Poor communication or language barriers', 'CS-COMM', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Knowledge', 'Staff lacking knowledge about policies/procedures', 'CS-KNOW', 'medium', 8),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Availability', 'Understaffing or staff unavailability issues', 'CS-AVAIL', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Complaint Handling', 'Inappropriate handling of customer complaints', 'CS-COMPL', 'high', 2),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Phone Support', 'Telephone support quality and availability', 'CS-PHONE', 'medium', 12),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Email/Chat Support', 'Digital communication support issues', 'CS-EMAIL', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Staff Professionalism', 'Unprofessional behavior by staff members', 'CS-PROF', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'CS'), 'Newcomer Experience', 'Poor onboarding experience for new clients', 'CS-NEW', 'high', 8),

-- Sales & Marketing Subcategories
((SELECT id FROM "categories" WHERE code = 'SM'), 'Misleading Information', 'False promises or incorrect sales information', 'SM-MISL', 'high', 8),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Aggressive Selling', 'Excessive or inappropriate sales pressure', 'SM-AGG', 'high', 12),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Trial Class Experience', 'Issues with trial class process and experience', 'SM-TRIAL', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Guest Passes/Referrals', 'Problems with guest pass and referral programs', 'SM-GUEST', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Events & Workshops', 'Marketing events and workshop-related issues', 'SM-EVENT', 'medium', 72),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Social Media', 'Social media marketing and communication issues', 'SM-SOCIAL', 'low', 72),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Brand Communication', 'Brand messaging and communication consistency', 'SM-BRAND', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'SM'), 'Communication Overload', 'Excessive marketing communications', 'SM-OVERLOAD', 'medium', 24),

-- Health & Safety Subcategories
((SELECT id FROM "categories" WHERE code = 'HS'), 'Equipment Safety', 'Faulty or dangerous equipment issues', 'HS-EQUIP', 'critical', 1),
((SELECT id FROM "categories" WHERE code = 'HS'), 'Injury During Class', 'Injuries occurring during fitness classes', 'HS-INJURY', 'critical', 1),
((SELECT id FROM "categories" WHERE code = 'HS'), 'Hygiene Protocols', 'Cleanliness and hygiene standard violations', 'HS-HYGIENE', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'HS'), 'COVID/Health Protocols', 'Health protocol violations and concerns', 'HS-COVID', 'high', 2),
((SELECT id FROM "categories" WHERE code = 'HS'), 'Air Quality', 'Poor ventilation or air quality issues', 'HS-AIR', 'high', 8),
((SELECT id FROM "categories" WHERE code = 'HS'), 'Emergency Preparedness', 'Emergency response and preparedness issues', 'HS-EMERGENCY', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'HS'), 'Medical Disclosure', 'Issues with medical condition disclosure process', 'HS-MEDICAL', 'high', 8),

-- Community & Culture Subcategories
((SELECT id FROM "categories" WHERE code = 'CC'), 'Studio Culture', 'Issues with overall studio atmosphere and culture', 'CC-CULTURE', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'CC'), 'Member Behavior', 'Inappropriate behavior by other members', 'CC-MEMBER', 'high', 8),
((SELECT id FROM "categories" WHERE code = 'CC'), 'Inclusivity Issues', 'Discrimination or lack of inclusiveness', 'CC-INCL', 'high', 4),
((SELECT id FROM "categories" WHERE code = 'CC'), 'Clique Behavior', 'Exclusive groups or cliquish behavior', 'CC-CLIQUE', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'CC'), 'Discrimination', 'Any form of discriminatory behavior', 'CC-DISCRIM', 'critical', 2),
((SELECT id FROM "categories" WHERE code = 'CC'), 'Community Events', 'Issues with community building events', 'CC-EVENTS', 'low', 72),

-- Special Programs Subcategories
((SELECT id FROM "categories" WHERE code = 'SP'), 'Private Sessions', 'Issues with personal training sessions', 'SP-PRIVATE', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'SP'), 'Workshop Quality', 'Quality issues with special workshops', 'SP-WORKSHOP', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'SP'), 'Challenges & Competitions', 'Issues with fitness challenges and competitions', 'SP-CHALLENGE', 'low', 72),
((SELECT id FROM "categories" WHERE code = 'SP'), 'Corporate Programs', 'Corporate wellness program issues', 'SP-CORP', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'SP'), 'Special Needs Programs', 'Accessibility and special needs program issues', 'SP-SPECIAL', 'high', 12),

-- Retail & Merchandise Subcategories
((SELECT id FROM "categories" WHERE code = 'RM'), 'Product Quality', 'Quality issues with retail products', 'RM-QUALITY', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'RM'), 'Product Availability', 'Out of stock or availability issues', 'RM-AVAIL', 'low', 72),
((SELECT id FROM "categories" WHERE code = 'RM'), 'Pricing', 'Pricing discrepancies or concerns', 'RM-PRICE', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'RM'), 'Return/Exchange', 'Product return and exchange issues', 'RM-RETURN', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'RM'), 'Staff Knowledge', 'Staff lacking product knowledge', 'RM-KNOW', 'medium', 24),

-- Miscellaneous Subcategories
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Policy Changes', 'Issues with policy changes and communication', 'MISC-POLICY', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Noise Disturbance', 'Noise and sound-related issues', 'MISC-NOISE', 'low', 72),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Guest Experience', 'General guest and visitor experience issues', 'MISC-GUEST', 'medium', 24),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Lost & Found', 'Lost and found item management', 'MISC-LOST', 'low', 72),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Nutrition/Wellness Advice', 'Issues with nutrition and wellness guidance', 'MISC-NUTRITION', 'medium', 48),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Multi-location Issues', 'Issues affecting multiple studio locations', 'MISC-MULTI', 'high', 12),
((SELECT id FROM "categories" WHERE code = 'MISC'), 'Feedback System', 'Issues with the feedback and review system', 'MISC-FEEDBACK', 'medium', 48)

ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- DYNAMIC FIELDS INSERTION (Based on CSV data)
-- ============================================================================

-- Global Fields (apply to all tickets)
INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder") VALUES

-- Global fields
('GLB-001', 'Ticket ID', 'Unique identifier for each ticket', (SELECT id FROM "fieldTypes" WHERE name = 'Auto-generated'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 1),
('GLB-002', 'Date & Time Reported', 'When the issue was reported to staff', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 2),
('GLB-003', 'Date & Time of Incident', 'When the issue actually occurred', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 3),
('GLB-004', 'Location', 'Studio location where issue occurred', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 4),
('GLB-005', 'Reported By (Staff)', 'Staff member logging the ticket', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 5),
('GLB-006', 'Client Name', 'Name of the client reporting issue', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 6),
('GLB-007', 'Client Email', 'Client''s email address', (SELECT id FROM "fieldTypes" WHERE name = 'Email'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, false, false, 7),
('GLB-008', 'Client Phone', 'Client''s contact number', (SELECT id FROM "fieldTypes" WHERE name = 'Phone'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, false, false, 8),
('GLB-009', 'Client Status', 'Client''s membership status', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 9),
('GLB-010', 'Priority', 'Urgency level of the issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 10),
('GLB-011', 'Department Routing', 'Which department should handle this', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 11),
('GLB-012', 'Issue Description', 'Detailed description of the issue', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 12),
('GLB-013', 'Action Taken Immediately', 'What was done on the spot', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, false, false, 13),
('GLB-014', 'Client Mood/Sentiment', 'Client''s emotional state', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, false, false, 14),
('GLB-015', 'Follow-up Required', 'Does this need additional follow-up', (SELECT id FROM "fieldTypes" WHERE name = 'Checkbox'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, true, false, 15),
('GLB-016', 'Attachments', 'Supporting documentation', (SELECT id FROM "fieldTypes" WHERE name = 'File Upload'), (SELECT id FROM "categories" WHERE code = 'GLB'), NULL, false, false, 16)

ON CONFLICT ("uniqueId") DO NOTHING;

-- Set options for global dropdown fields
UPDATE "dynamicFields" SET options = ARRAY[
    'Kwality House Kemps Corner', 'Kenkre House', 'South United Football Club', 
    'Supreme HQ Bandra', 'WeWork Prestige Central', 'WeWork Galaxy', 
    'The Studio by Copper + Cloves', 'Pop-up'
] WHERE "uniqueId" = 'GLB-004';

UPDATE "dynamicFields" SET options = ARRAY[
    'Existing Active', 'Existing Inactive', 'New Prospect', 'Trial Client', 'Guest (Hosted Class)'
] WHERE "uniqueId" = 'GLB-009';

UPDATE "dynamicFields" SET options = ARRAY[
    'Low (log only)', 'Medium (48hrs)', 'High (24hrs)', 'Critical (immediate)'
] WHERE "uniqueId" = 'GLB-010';

UPDATE "dynamicFields" SET options = ARRAY[
    'Operations', 'Facilities', 'Training', 'Sales', 'Client Success', 'Marketing', 'Finance', 'Management'
] WHERE "uniqueId" = 'GLB-011';

UPDATE "dynamicFields" SET options = ARRAY[
    'Calm', 'Frustrated', 'Angry', 'Disappointed', 'Understanding'
] WHERE "uniqueId" = 'GLB-014';

-- Sample Booking & Technology fields (App/Website Issues)
INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- App/Website Issues
('BT-APP-001', 'Issue Type', 'Specific type of technical issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-APP'), true, false, 1,
 ARRAY['App Crash', 'Slow Loading', 'Login Problems', 'Feature Not Working', 'UI/UX Confusion', 'Other']),

('BT-APP-002', 'Platform', 'Which platform had the issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-APP'), true, false, 2,
 ARRAY['iOS App', 'Android App', 'Website (Desktop)', 'Website (Mobile)']),

('BT-APP-003', 'Device/Browser', 'Device model or browser used', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-APP'), false, false, 3,
 NULL),

('BT-APP-004', 'App Version', 'Version number of the app', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-APP'), false, true, 4,
 NULL),

('BT-APP-005', 'Error Message', 'Exact error message shown', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-APP'), false, false, 5,
 NULL),

-- Booking Failures
('BT-BOOK-001', 'Class Attempted', 'Which class they tried to book', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-BOOK'), true, false, 1,
 ARRAY['Barre 57', 'Cardio Barre', 'Signature', 'Express', 'Private Session']),

('BT-BOOK-002', 'Instructor', 'Instructor for the class', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-BOOK'), true, false, 2,
 ARRAY['Instructor 1', 'Instructor 2', 'Instructor 3', 'Guest Instructor']),

('BT-BOOK-003', 'Class Date & Time', 'When was the class', (SELECT id FROM "fieldTypes" WHERE name = 'DateTime'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-BOOK'), true, false, 3,
 NULL),

('BT-BOOK-004', 'Failure Type', 'Nature of booking failure', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-BOOK'), true, false, 4,
 ARRAY['Unable to Book', 'Booking Not Confirmed', 'Double Booking', 'Booking Disappeared', 'Other']),

-- Payment Gateway
('BT-PAY-001', 'Transaction Type', 'What they were trying to pay for', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), true, false, 1,
 ARRAY['New Purchase', 'Renewal', 'Upgrade', 'Additional Credits', 'Retail Purchase', 'Other']),

('BT-PAY-002', 'Package/Product', 'Specific package or product', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), true, false, 2,
 ARRAY['10 Class Package', '20 Class Package', 'Monthly Unlimited', 'Annual Membership']),

('BT-PAY-003', 'Amount', 'Transaction amount', (SELECT id FROM "fieldTypes" WHERE name = 'Number'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), true, false, 3,
 NULL),

('BT-PAY-004', 'Payment Method', 'Payment method attempted', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), true, false, 4,
 ARRAY['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other']),

('BT-PAY-005', 'Issue Type', 'Type of payment issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), true, false, 5,
 ARRAY['Transaction Failed', 'Amount Deducted But Booking Failed', 'Payment Gateway Timeout', 'Card Declined', 'Multiple Charges', 'Other'])

ON CONFLICT ("uniqueId") DO NOTHING;

-- Sample Customer Service fields
INSERT INTO "dynamicFields" ("uniqueId", "label", "description", "fieldTypeId", "categoryId", "subcategoryId", "isRequired", "isHidden", "sortOrder", "options") VALUES

-- Front Desk Service
('CS-DESK-001', 'Staff Member Involved', 'Which staff member', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-DESK'), false, false, 1,
 ARRAY['Staff Member 1', 'Staff Member 2', 'Manager', 'Unknown']),

('CS-DESK-002', 'Issue Type', 'Nature of service issue', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-DESK'), true, false, 2,
 ARRAY['Rude Behavior', 'Unhelpful Attitude', 'Lack of Knowledge', 'Inattentive', 'Unprofessional Conduct', 'Other']),

('CS-DESK-003', 'Specific Incident', 'What exactly happened', (SELECT id FROM "fieldTypes" WHERE name = 'Long Text'), 
 (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-DESK'), true, false, 3,
 NULL),

('CS-DESK-004', 'Client Request/Query', 'What did client need', (SELECT id FROM "fieldTypes" WHERE name = 'Text'), 
 (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-DESK'), true, false, 4,
 NULL),

('CS-DESK-005', 'Request Fulfilled', 'Was request handled', (SELECT id FROM "fieldTypes" WHERE name = 'Dropdown'), 
 (SELECT id FROM "categories" WHERE code = 'CS'), (SELECT id FROM "subcategories" WHERE code = 'CS-DESK'), true, false, 5,
 ARRAY['Yes - Immediately', 'Yes - After Delay', 'No - Unable to Fulfill', 'No - Refused'])

ON CONFLICT ("uniqueId") DO NOTHING;

-- ============================================================================
-- SLA RULES INSERTION
-- ============================================================================

INSERT INTO "slaRules" ("name", "description", "categoryId", "subcategoryId", "priority", "firstResponseHours", "resolutionHours", "escalationHours") VALUES

-- Critical/High Priority SLA Rules
('Critical Health & Safety', 'Immediate response for safety issues', 
 (SELECT id FROM "categories" WHERE code = 'HS'), NULL, 'critical', 0.25, 2, 1),

('High Priority Customer Service', 'Fast response for customer service issues', 
 (SELECT id FROM "categories" WHERE code = 'CS'), NULL, 'high', 1, 8, 4),

('Payment Issues', 'Quick resolution for payment problems', 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-PAY'), NULL, 2, 12, 6),

('Booking Failures', 'Urgent resolution for booking issues', 
 (SELECT id FROM "categories" WHERE code = 'BT'), (SELECT id FROM "subcategories" WHERE code = 'BT-BOOK'), 'high', 1, 8, 4),

-- Standard SLA Rules
('Standard Technology Issues', 'Normal response for tech issues', 
 (SELECT id FROM "categories" WHERE code = 'BT'), NULL, 'medium', 4, 24, 12),

('Sales & Marketing', 'Standard response for sales issues', 
 (SELECT id FROM "categories" WHERE code = 'SM'), NULL, NULL, 8, 48, 24),

('Retail & Merchandise', 'Lower priority for retail issues', 
 (SELECT id FROM "categories" WHERE code = 'RM'), NULL, NULL, 12, 72, 36),

('Miscellaneous Issues', 'Standard response for misc issues', 
 (SELECT id FROM "categories" WHERE code = 'MISC'), NULL, NULL, 8, 48, 24)

ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE WORKFLOW RULES
-- ============================================================================

INSERT INTO "workflowRules" ("name", "description", "triggerEvent", "conditions", "actions") VALUES

('Auto-assign Critical Tickets', 'Automatically assign critical tickets to managers', 'ticket_created',
 '{"priority": "critical"}',
 '{"actions": [{"type": "assign_to_role", "role": "manager"}, {"type": "send_notification", "channels": ["email", "sms"]}]}'),

('Escalate Overdue Tickets', 'Escalate tickets that are past due', 'sla_breach',
 '{"sla_breach_type": "resolution"}',
 '{"actions": [{"type": "escalate_to_manager"}, {"type": "increase_priority"}, {"type": "notify_stakeholders"}]}'),

('Health & Safety Notifications', 'Immediate notifications for health issues', 'ticket_created',
 '{"category_code": "HS"}',
 '{"actions": [{"type": "notify_all_managers"}, {"type": "create_incident_report"}, {"type": "set_high_priority"}]}'),

('Auto-close Resolved Tickets', 'Automatically close tickets after customer confirmation', 'status_changed',
 '{"new_status": "resolved", "days_in_status": 3}',
 '{"actions": [{"type": "change_status", "status": "closed"}, {"type": "send_satisfaction_survey"}]}')

ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 
    'Comprehensive data insertion completed successfully!' as message,
    (SELECT COUNT(*) FROM "subcategories") as subcategories_created,
    (SELECT COUNT(*) FROM "dynamicFields") as dynamic_fields_created,
    (SELECT COUNT(*) FROM "slaRules") as sla_rules_created,
    (SELECT COUNT(*) FROM "workflowRules") as workflow_rules_created;