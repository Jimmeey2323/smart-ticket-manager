import { db } from "./db";
import { studios, teams, categories, subcategories } from "@shared/schema";

async function seed() {
  if (!db) {
    console.error("Database not configured. Set DATABASE_URL environment variable.");
    process.exit(1);
  }

  console.log("Seeding database...");

  const studioData = [
    { name: "Bandra Studio", location: "Bandra West", city: "Mumbai", state: "Maharashtra", address: "Ground Floor, Krystal Building, Waterfield Road, Bandra West", contactEmail: "bandra@physique57india.com", contactPhone: "+91 22 2642 5757" },
    { name: "Lower Parel Studio", location: "Lower Parel", city: "Mumbai", state: "Maharashtra", address: "2nd Floor, Marathon Futurex, NM Joshi Marg, Lower Parel", contactEmail: "lowerparel@physique57india.com", contactPhone: "+91 22 2497 5757" },
    { name: "Powai Studio", location: "Powai", city: "Mumbai", state: "Maharashtra", address: "1st Floor, Central Avenue, Hiranandani Gardens, Powai", contactEmail: "powai@physique57india.com", contactPhone: "+91 22 2570 5757" },
    { name: "BKC Studio", location: "BKC", city: "Mumbai", state: "Maharashtra", address: "Ground Floor, One BKC, Bandra Kurla Complex", contactEmail: "bkc@physique57india.com", contactPhone: "+91 22 4000 5757" },
    { name: "Juhu Studio", location: "Juhu", city: "Mumbai", state: "Maharashtra", address: "1st Floor, AB Tower, Juhu Tara Road, Juhu", contactEmail: "juhu@physique57india.com", contactPhone: "+91 22 2660 5757" },
    { name: "Delhi Studio", location: "GK-2", city: "Delhi", state: "Delhi", address: "N-Block Market, Greater Kailash 2, New Delhi", contactEmail: "delhi@physique57india.com", contactPhone: "+91 11 4100 5757" },
    { name: "Gurgaon Studio", location: "Golf Course Road", city: "Gurgaon", state: "Haryana", address: "Ground Floor, DLF Phase 5, Golf Course Road, Gurgaon", contactEmail: "gurgaon@physique57india.com", contactPhone: "+91 124 428 5757" },
    { name: "Bangalore Studio", location: "Indiranagar", city: "Bangalore", state: "Karnataka", address: "100 Feet Road, Indiranagar, Bangalore", contactEmail: "bangalore@physique57india.com", contactPhone: "+91 80 4150 5757" },
  ];

  const teamData = [
    { name: "Operations", description: "Studio operations and facility management", email: "operations@physique57india.com", slaHours: 24 },
    { name: "Facilities", description: "Equipment maintenance and studio upkeep", email: "facilities@physique57india.com", slaHours: 48 },
    { name: "Training", description: "Instructor training and class quality", email: "training@physique57india.com", slaHours: 24 },
    { name: "Sales", description: "Membership sales and renewals", email: "sales@physique57india.com", slaHours: 12 },
    { name: "Client Success", description: "Client experience and retention", email: "success@physique57india.com", slaHours: 8 },
    { name: "Marketing", description: "Promotions and brand communications", email: "marketing@physique57india.com", slaHours: 24 },
    { name: "Finance", description: "Billing, refunds, and payments", email: "finance@physique57india.com", slaHours: 48 },
    { name: "Management", description: "Senior leadership and escalations", email: "management@physique57india.com", slaHours: 12 },
    { name: "IT/Tech Support", description: "App, website, and tech issues", email: "tech@physique57india.com", slaHours: 4 },
    { name: "HR", description: "Staff-related matters", email: "hr@physique57india.com", slaHours: 48 },
  ];

  const categoryData = [
    { name: "Booking Issues", description: "Class booking, cancellation, and scheduling problems", icon: "Calendar", defaultPriority: "high", defaultSlaHours: 4 },
    { name: "Membership", description: "Membership plans, renewals, and package inquiries", icon: "CreditCard", defaultPriority: "medium", defaultSlaHours: 24 },
    { name: "Billing & Payments", description: "Payment issues, refunds, and invoice queries", icon: "DollarSign", defaultPriority: "high", defaultSlaHours: 12 },
    { name: "Class Experience", description: "Instructor feedback, class quality, and session issues", icon: "Star", defaultPriority: "medium", defaultSlaHours: 24 },
    { name: "Facility Issues", description: "Studio cleanliness, equipment, and amenities", icon: "Building", defaultPriority: "medium", defaultSlaHours: 48 },
    { name: "App & Website", description: "Technical issues with booking app or website", icon: "Smartphone", defaultPriority: "high", defaultSlaHours: 4 },
    { name: "Staff Feedback", description: "Feedback about front desk, trainers, or staff", icon: "Users", defaultPriority: "medium", defaultSlaHours: 24 },
    { name: "Merchandise", description: "Product orders, returns, and availability", icon: "ShoppingBag", defaultPriority: "low", defaultSlaHours: 72 },
    { name: "Safety & Incident", description: "Injuries, safety concerns, or incidents", icon: "AlertTriangle", defaultPriority: "critical", defaultSlaHours: 1 },
    { name: "General Inquiry", description: "General questions and information requests", icon: "HelpCircle", defaultPriority: "low", defaultSlaHours: 48 },
  ];

  try {
    const existingStudios = await db.select().from(studios).limit(1);
    if (existingStudios.length === 0) {
      await db.insert(studios).values(studioData);
      console.log("Studios seeded");
    } else {
      console.log("Studios already exist, skipping");
    }

    const existingTeams = await db.select().from(teams).limit(1);
    if (existingTeams.length === 0) {
      await db.insert(teams).values(teamData);
      console.log("Teams seeded");
    } else {
      console.log("Teams already exist, skipping");
    }

    const existingCategories = await db.select().from(categories).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(categories).values(categoryData);
      console.log("Categories seeded");
    } else {
      console.log("Categories already exist, skipping");
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding error:", error);
  }

  process.exit(0);
}

seed();
