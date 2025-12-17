-- Insert Dynamic Fields for Hosted Classes (p57_hc_*)
-- Category: Special Programs (d2fab980-96b8-4147-b99f-6debae7167b0)

INSERT INTO "dynamicFields" ("uniqueId", "label", "fieldTypeId", "categoryId", "isRequired", "isActive", "sortOrder", "options", "description") VALUES
-- Identification Section
('p57_hc_event_date', 'Event Date', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 10, NULL, 'Date when the hosted/influencer class took place'),
('p57_hc_location', 'Location', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 20, ARRAY['Kwality House, Kemps Corner', 'Palladium, Lower Parel', 'Jio World Plaza, BKC'], 'Studio or venue where the class was conducted'),
('p57_hc_partner_name', 'Influencer / Partner Name', '64d98414-4496-4167-a119-f017857df0f5', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 30, NULL, 'Name of influencer or collaborating brand'),
('p57_hc_logged_by', 'Logged By', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 40, ARRAY['Front Desk Staff', 'Studio Manager', 'Trainer', 'Marketing Team'], 'Staff member submitting this form'),

-- Core Information Section
('p57_hc_class_type', 'Class Type', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 50, ARRAY['Signature Barre', 'Reform & Restore', 'Cardio Barre', 'Strength & Sculpt', 'Studio Hosted Class', 'Private Session', 'Workshop'], 'Class format delivered during the event'),
('p57_hc_trainer', 'Trainer Conducting Class', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 60, ARRAY['Select Trainer'], 'Trainer who led the hosted class'),
('p57_hc_total_attendees', 'Total Attendees', 'a455f17f-b6a9-478b-9d87-a243caabb920', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 70, NULL, 'Total number of people who attended'),
('p57_hc_new_prospects', 'New Prospects Count', 'a455f17f-b6a9-478b-9d87-a243caabb920', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 80, NULL, 'Attendees who were new to Physique 57'),
('p57_hc_existing_clients', 'Existing Clients Count', 'a455f17f-b6a9-478b-9d87-a243caabb920', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 90, NULL, 'Attendees who were existing clients'),
('p57_hc_conversion_booked', 'Conversion Appointments Booked', 'a455f17f-b6a9-478b-9d87-a243caabb920', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 100, NULL, 'Number of trials/sales appointments scheduled'),

-- Sales Intelligence Section
('p57_hc_packages_discussed', 'Packages Discussed', '5a3f3868-683c-454e-8cd0-25486098a527', 'd2fab980-96b8-4147-b99f-6debae7167b0', false, true, 110, ARRAY['Memberships', 'Class Packages', 'Privates', 'Single Classes', 'Gift Cards', 'Others'], 'Products/packages discussed with attendees'),
('p57_hc_objections', 'Key Objections Raised', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', 'd2fab980-96b8-4147-b99f-6debae7167b0', false, true, 120, NULL, 'Common objections or hesitations expressed'),

-- Impact Assessment Section
('p57_hc_audience_fit', 'Influencer Audience Fit', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 130, ARRAY['Strong Fit', 'Moderate Fit', 'Poor Fit'], 'How relevant was the influencer audience'),
('p57_hc_revenue_potential', 'Estimated Revenue Potential', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 140, ARRAY['Low (<₹25k)', 'Medium (₹25k–₹75k)', 'High (>₹75k)'], 'Sales potential from this event'),

-- Routing Section
('p57_hc_followup_owner', 'Follow-Up Owner', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'd2fab980-96b8-4147-b99f-6debae7167b0', true, true, 150, ARRAY['Sales', 'Marketing', 'Client Success', 'Management'], 'Department responsible for next action'),
('p57_hc_followup_deadline', 'Follow-Up Deadline', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', 'd2fab980-96b8-4147-b99f-6debae7167b0', false, true, 160, NULL, 'Date by which follow-up should be completed');

-- Insert Dynamic Fields for Studio Amenities & Facilities (p57_afp_*)
-- Category: Health & Safety (bd4c7c4f-b4ea-4d39-9f34-25b4573a106a)

INSERT INTO "dynamicFields" ("uniqueId", "label", "fieldTypeId", "categoryId", "isRequired", "isActive", "sortOrder", "options", "description") VALUES
-- Identification Section
('p57_afp_logged_datetime', 'Issue Logged Date & Time', '2a14a8bc-3e02-4039-9f46-4efa6287371a', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 10, NULL, 'Timestamp when the issue was observed'),
('p57_afp_location', 'Location', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 20, ARRAY['Kwality House, Kemps Corner', 'Palladium, Lower Parel', 'Jio World Plaza, BKC'], 'Studio where the issue occurred'),
('p57_afp_logged_by', 'Logged By', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 30, ARRAY['Front Desk Staff', 'Studio Manager', 'Trainer', 'Cleaning Staff'], 'Staff member submitting this report'),

-- Core Information Section
('p57_afp_issue_category', 'Issue Category', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 40, ARRAY['Equipment/Facilities', 'Amenities (Washrooms/Lockers/Water)', 'Personnel', 'Safety Concern'], 'Broad classification of the issue'),
('p57_afp_specific_area', 'Specific Area / Asset', '64d98414-4496-4167-a119-f017857df0f5', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 50, NULL, 'Area, room, or asset involved'),
('p57_afp_issue_description', 'Issue Description', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 60, NULL, 'Factual description of what is not working'),
('p57_afp_personnel_involved', 'Personnel Involved', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', false, true, 70, ARRAY['N/A', 'Select Staff Member'], 'Staff member(s) involved in the issue'),

-- Impact Assessment Section
('p57_afp_classes_impacted', 'Class(es) Impacted', '1229f571-876c-4a6b-8587-bd3e5d075639', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', false, true, 80, ARRAY['Signature Barre', 'Reform & Restore', 'Cardio Barre', 'Strength & Sculpt', 'Private Sessions', 'None'], 'Classes affected due to this issue'),
('p57_afp_client_impact', 'Client Impact Observed', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 90, ARRAY['Yes – service disruption', 'Yes – safety risk', 'No client impact yet'], 'Whether clients were directly impacted'),
('p57_afp_action_taken', 'Immediate Action Taken', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', false, true, 100, NULL, 'Temporary fix or action already taken'),
('p57_afp_priority', 'Priority Level', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 110, ARRAY['Low (log only)', 'Medium (48hrs)', 'High (24hrs)', 'Critical (immediate)'], 'Urgency based on impact and risk'),

-- Routing Section
('p57_afp_department', 'Department to Notify', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 120, ARRAY['Facilities', 'Operations', 'Training', 'Client Success', 'Management'], 'Team responsible for resolution'),
('p57_afp_followup_required', 'Follow-Up Required', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', true, true, 130, ARRAY['Yes', 'No'], 'Whether additional follow-up is needed'),
('p57_afp_followup_deadline', 'Follow-Up Deadline', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', 'bd4c7c4f-b4ea-4d39-9f34-25b4573a106a', false, true, 140, NULL, 'Target date for issue resolution');

-- Insert Dynamic Fields for Studio Repair & Maintenance (p57_rm_*)
-- Category: Facilities (9c79768f-2832-49c8-8e24-4f2624e1c797)

INSERT INTO "dynamicFields" ("uniqueId", "label", "fieldTypeId", "categoryId", "isRequired", "isActive", "sortOrder", "options", "description") VALUES
-- Identification Section
('p57_rm_logged_datetime', 'Issue Logged Date & Time', '2a14a8bc-3e02-4039-9f46-4efa6287371a', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 10, NULL, 'When the issue was identified'),
('p57_rm_location', 'Location', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 20, ARRAY['Kwality House, Kemps Corner', 'Palladium, Lower Parel', 'Jio World Plaza, BKC'], 'Studio or site where issue occurred'),
('p57_rm_logged_by', 'Logged By', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 30, ARRAY['Front Desk Staff', 'Studio Manager', 'Trainer', 'Maintenance Staff'], 'Staff member reporting issue'),
('p57_rm_shift', 'Shift During Discovery', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 40, ARRAY['Opening', 'Mid-day', 'Closing'], 'Shift when issue was noticed'),

-- Core Information Section
('p57_rm_issue_type', 'Issue Type', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 50, ARRAY['Equipment', 'Electrical', 'Plumbing', 'HVAC / AC', 'Structural', 'Cleanliness / Upkeep', 'IT / AV', 'Other'], 'Category of maintenance issue'),
('p57_rm_asset_name', 'Asset / Equipment Name', '64d98414-4496-4167-a119-f017857df0f5', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 60, NULL, 'Specific asset or area affected'),
('p57_rm_asset_id', 'Asset ID / Tag', '64d98414-4496-4167-a119-f017857df0f5', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 70, NULL, 'Internal tag or identifier for the asset'),
('p57_rm_issue_description', 'Issue Description', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 80, NULL, 'Factual description of problem observed'),
('p57_rm_suspected_cause', 'Suspected Cause', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 90, ARRAY['Wear & tear', 'Improper use', 'Power / utility issue', 'Vendor fault', 'Unknown'], 'Likely reason for issue'),
('p57_rm_first_observed', 'Issue First Observed On', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 100, NULL, 'Date issue was first noticed'),
('p57_rm_frequency', 'Frequency of Issue', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 110, ARRAY['First occurrence', 'Repeat issue', 'Frequent recurring'], 'Whether this is a repeat problem'),

-- Impact Assessment Section
('p57_rm_classes_impacted', 'Classes Impacted', '1229f571-876c-4a6b-8587-bd3e5d075639', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 120, ARRAY['Signature Barre', 'Reform & Restore', 'Cardio Barre', 'Strength & Sculpt', 'Private Sessions', 'None'], 'Classes affected or at risk'),
('p57_rm_class_cancelled', 'Class Cancellations Required', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 130, ARRAY['Yes', 'No'], 'Whether any classes were cancelled'),
('p57_rm_estimated_downtime', 'Estimated Downtime (Hours)', 'a455f17f-b6a9-478b-9d87-a243caabb920', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 140, NULL, 'Expected equipment or area downtime'),
('p57_rm_client_impact', 'Client Impact Level', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 150, ARRAY['No impact', 'Minor inconvenience', 'Class disruption', 'Safety risk'], 'Level of disruption or risk to clients'),
('p57_rm_temp_action', 'Temporary Action Taken', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 160, NULL, 'Workaround or safety measure applied'),
('p57_rm_priority', 'Priority Level', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 170, ARRAY['Low (log only)', 'Medium (48hrs)', 'High (24hrs)', 'Critical (immediate)'], 'Urgency of resolution'),

-- Routing Section
('p57_rm_vendor_required', 'Vendor / Technician Required', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 180, ARRAY['Yes', 'No'], 'Whether external help is needed'),
('p57_rm_preferred_vendor', 'Preferred Vendor', '64d98414-4496-4167-a119-f017857df0f5', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 190, NULL, 'Vendor name if already identified'),
('p57_rm_vendor_called_date', 'Vendor Called Date', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 200, NULL, 'When vendor was contacted'),
('p57_rm_department', 'Department to Notify', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 210, ARRAY['Facilities', 'Operations', 'Management'], 'Team responsible for coordination'),
('p57_rm_approved_by', 'Repair Approved By', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 220, ARRAY['Studio Manager', 'Operations Head', 'Finance Head', 'CEO'], 'Manager who approved the repair'),

-- Financial Impact Section
('p57_rm_estimated_cost', 'Estimated Repair Cost (₹)', 'a455f17f-b6a9-478b-9d87-a243caabb920', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 230, NULL, 'Expected cost before work begins'),
('p57_rm_actual_cost', 'Actual Repair Cost (₹)', 'a455f17f-b6a9-478b-9d87-a243caabb920', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 240, NULL, 'Final cost after completion'),

-- Closure Section
('p57_rm_status', 'Resolution Status', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '9c79768f-2832-49c8-8e24-4f2624e1c797', true, true, 250, ARRAY['Logged', 'In Progress', 'Awaiting Vendor', 'Resolved', 'Deferred'], 'Current status of the issue'),
('p57_rm_resolution_date', 'Actual Resolution Date', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 260, NULL, 'Date issue was fully resolved'),
('p57_rm_preventive_action', 'Preventive Action Recommended', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '9c79768f-2832-49c8-8e24-4f2624e1c797', false, true, 270, NULL, 'Steps to avoid recurrence');

-- Insert Dynamic Fields for Trainer Feedback (p57_tf_*)
-- Category: Customer Service (92c1ab90-cefb-452c-b555-7bb4e86afb8e)

INSERT INTO "dynamicFields" ("uniqueId", "label", "fieldTypeId", "categoryId", "isRequired", "isActive", "sortOrder", "options", "description") VALUES
-- Identification Section
('p57_tf_logged_datetime', 'Feedback Logged Date & Time', '2a14a8bc-3e02-4039-9f46-4efa6287371a', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 10, NULL, 'When this feedback is being recorded'),
('p57_tf_location', 'Location', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 20, ARRAY['Kwality House, Kemps Corner', 'Palladium, Lower Parel', 'Jio World Plaza, BKC'], 'Studio where the observation occurred'),
('p57_tf_logged_by', 'Logged By', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 30, ARRAY['Front Desk Staff', 'Studio Manager', 'Client', 'Other Staff'], 'Staff member submitting this feedback'),
('p57_tf_trainer', 'Trainer Name', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 40, ARRAY['Select Trainer'], 'Trainer being referenced'),

-- Core Information Section
('p57_tf_class_type', 'Class Type', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 50, ARRAY['Signature Barre', 'Reform & Restore', 'Cardio Barre', 'Strength & Sculpt', 'Private Session', 'Workshop'], 'Class during which the observation occurred'),
('p57_tf_feedback_category', 'Feedback Category', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 60, ARRAY['Class Delivery', 'Client Interaction', 'Professional Conduct', 'Punctuality', 'Safety / Form Correction', 'Protocol Compliance', 'Other'], 'Primary nature of feedback'),
('p57_tf_observation', 'Specific Observation', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 70, NULL, 'Factual description of what was observed'),

-- Impact Assessment Section
('p57_tf_clients_impacted', 'Client(s) Impacted', '64d98414-4496-4167-a119-f017857df0f5', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', false, true, 80, NULL, 'Client name(s) if applicable'),
('p57_tf_client_impact', 'Client Impact Level', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 90, ARRAY['No impact', 'Minor dissatisfaction', 'Class disruption', 'Safety concern'], 'Extent of impact on client experience'),
('p57_tf_repeat_issue', 'Was This a Repeat Issue?', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', false, true, 100, ARRAY['Yes', 'No', 'Unsure'], 'Whether this has occurred before'),
('p57_tf_action_taken', 'Immediate Action Taken', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', false, true, 110, NULL, 'Any real-time correction or intervention'),
('p57_tf_priority', 'Priority Level', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 120, ARRAY['Low (log only)', 'Medium (48hrs)', 'High (24hrs)', 'Critical (immediate)'], 'Urgency for review or action'),

-- Routing Section
('p57_tf_department', 'Department to Notify', '21617df7-40d6-4a30-a4fe-f4d8f31e57cc', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 130, ARRAY['Training', 'Operations', 'Client Success', 'Management'], 'Team responsible for follow-up'),
('p57_tf_followup_required', 'Follow-Up Required', 'f8d69a39-8fc1-42b0-a6ff-3be68894fb7b', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', true, true, 140, ARRAY['Yes', 'No'], 'Whether further action is needed'),
('p57_tf_followup_deadline', 'Follow-Up Deadline', 'c33b4ab1-6b05-4a99-9f0e-dd8f32f5846f', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', false, true, 150, NULL, 'Target date for review or action'),

-- Closure Section
('p57_tf_manager_notes', 'Manager Review Notes', '609b5efa-0b02-4dec-a4c7-9ac4e85634f7', '92c1ab90-cefb-452c-b555-7bb4e86afb8e', false, true, 160, NULL, 'Notes added during review or closure');