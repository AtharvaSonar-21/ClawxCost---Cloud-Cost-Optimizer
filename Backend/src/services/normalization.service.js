const SERVICE_MAP = {
  aws: {
    EC2: { serviceType: "compute", category: "vm" },
    S3: { serviceType: "storage", category: "object-storage" },
    RDS: { serviceType: "compute", category: "db" },
  },
  gcp: {
    "Compute Engine": { serviceType: "compute", category: "vm" },
    "Cloud Storage": { serviceType: "storage", category: "object-storage" },
    "Cloud SQL": { serviceType: "compute", category: "db" },
  },
  azure: {
    "Virtual Machines": { serviceType: "compute", category: "vm" },
    "Blob Storage": { serviceType: "storage", category: "object-storage" },
    "SQL Database": { serviceType: "compute", category: "db" },
  },
};


export function normalizeBillingRecord(raw) {
  if (!raw || !raw.provider || !raw.service) {
    throw new Error("Invalid billing record: provider and service are required.");
  }

  const provider = raw.provider;
  const service = raw.service;

  const mapped = SERVICE_MAP[provider]?.[service];

  if (!mapped) {
    throw new Error(
      `Unsupported provider/service combination: ${provider} - ${service}.`
    );
  }

  return {
    userId: raw.userId,
    provider,
    serviceType: mapped.serviceType,
    category: mapped.category,
    region: raw.region,
    dailyCost: raw.cost,
    usageHours: raw.usageHours,
    date: raw.date,
  };
}
