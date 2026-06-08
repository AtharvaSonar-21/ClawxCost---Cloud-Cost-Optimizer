import mongoose from "mongoose";
import dotenv from "dotenv";
import BillingRaw from "./src/models/BillingRaw.js";
import BillingNormalized from "./src/models/BillingNormalized.js";
import { normalizeBillingRecord } from "./src/services/normalization.service.js";
import { runAnomalyDetection } from "./src/services/anomaly-detection.service.js";
import { recalculateAllTrends } from "./src/services/trends.service.js";
import { generateRecommendations } from "./src/services/recommendations.service.js";

dotenv.config();

const PROVIDERS = ["aws", "gcp", "azure"];
const SERVICES = {
  aws: ["EC2", "S3", "RDS"],
  gcp: ["Compute Engine", "Cloud Storage", "Cloud SQL"],
  azure: ["Virtual Machines", "Blob Storage", "SQL Database"],
};
const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];

async function generateBillingData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data for clean test
    await BillingRaw.deleteMany({});
    await BillingNormalized.deleteMany({});
    console.log("🧹 Cleaned existing data");

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 10);

    const records = [];

    // Generate 10 days of data
    for (let day = 0; day < 10; day++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + day);

      // Generate 2-4 entries per day per provider
      for (const provider of PROVIDERS) {
        const entriesPerProvider = Math.floor(Math.random() * 3) + 2; // 2-4 entries

        for (let i = 0; i < entriesPerProvider; i++) {
          const service = SERVICES[provider][Math.floor(Math.random() * SERVICES[provider].length)];
          const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
          const usageHours = Math.floor(Math.random() * 24) + 1;

          // Base cost: $50-200 per day
          let baseCost = Math.random() * 150 + 50;

          // Day 9 (last day): Inject a major cost spike for compute
          if (day === 9 && service.toLowerCase().includes("compute") && provider === "aws") {
            baseCost = 310; // 2.2x spike for EC2
            console.log(`💥 Injected SPIKE for ${provider} ${service}: $${baseCost}`);
          }

          const cost = parseFloat(baseCost.toFixed(2));

          const raw = await BillingRaw.create({
            provider,
            service,
            region,
            usageHours,
            cost,
            date: currentDate,
          });

          // Normalize
          const normalized = normalizeBillingRecord(raw);
          await BillingNormalized.create(normalized);

          records.push({
            provider,
            service,
            region,
            cost,
            date: currentDate.toISOString().split("T")[0],
          });
        }
      }
    }

    console.log(`\n📊 Generated ${records.length} billing records`);
    console.log("\n📋 Sample Records:");
    records.slice(0, 5).forEach((r) => {
      console.log(`   ${r.date} | ${r.provider} | ${r.service} | $${r.cost}`);
    });
    console.log(`   ... and ${records.length - 5} more\n`);

    // Trigger trend calculation
    console.log("📈 Calculating trends...");
    const trends = await recalculateAllTrends();
    console.log(`✅ Trends calculated: ${trends.summary.totalTrends} unique service combinations`);
    console.log(`⚠️  Anomalies detected: ${trends.anomalies.length}`);

    // Trigger anomaly detection
    console.log("\n🔍 Running anomaly detection...");
    const incidents = await runAnomalyDetection();
    console.log(`✅ Detection complete`);
    console.log(`   Active incidents: ${incidents.summary.activeIncidents}`);
    console.log(`   By type:`);
    console.log(`   - Cost spikes: ${incidents.incidents?.filter((i) => i.incidentType === "cost_spike").length || 0}`);
    console.log(`   - Dominance risks: ${incidents.incidents?.filter((i) => i.incidentType === "dominance_risk").length || 0}`);
    console.log(
      `   - Vendor concentration: ${incidents.incidents?.filter((i) => i.incidentType === "vendor_concentration_risk").length || 0}`
    );

    // Generate recommendations
    console.log("\n💡 Generating recommendations...");
    const recommendations = await generateRecommendations();
    console.log(`✅ Recommendations generated`);
    console.log(`   Total active: ${recommendations.summary.totalActive}`);
    if (recommendations.recommendations?.length > 0) {
      console.log(`   By type:`);
      console.log(
        `   - Compute rightsizing: ${recommendations.recommendations?.filter((r) => r.recommendationType === "compute_rightsizing").length || 0}`
      );
      console.log(
        `   - Storage lifecycle: ${recommendations.recommendations?.filter((r) => r.recommendationType === "storage_lifecycle").length || 0}`
      );
      console.log(
        `   - Region diversification: ${recommendations.recommendations?.filter((r) => r.recommendationType === "region_diversification").length || 0}`
      );
      const totalSavings = recommendations.recommendations.reduce((sum, r) => sum + r.estimatedSavings.monthlyAmount, 0);
      console.log(`   💰 Potential monthly savings: $${totalSavings.toFixed(2)}`);
    }

    console.log("\n✨ Test data generation complete!");
    console.log("\n🚀 Next steps:");
    console.log("   GET http://localhost:5000/analytics/comprehensive");
    console.log("   GET http://localhost:5000/incidents");
    console.log("   GET http://localhost:5000/recommendations");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

generateBillingData();
