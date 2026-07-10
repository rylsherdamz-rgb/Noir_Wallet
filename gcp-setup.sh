#!/usr/bin/env bash
set -euo pipefail

# ── GCP one-time infrastructure setup for Noir Wallet Backend ──
# Run this once as Project Owner, then CI/CD handles the rest.

PROJECT="noir-wallet-hackathon"
REGION="us-central1"
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format="value(projectNumber)")
SA_NAME="noir-backend-deployer"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
REPO="anomalyco/Noir_Wallet"

echo "Setting up infra for $PROJECT ($PROJECT_NUMBER)..."

# 1. Enable APIs
echo "=== Enabling APIs ==="
gcloud services enable run.googleapis.com secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com iamcredentials.googleapis.com \
  artifactregistry.googleapis.com

# 2. Create Artifact Registry
echo "=== Creating Artifact Registry ==="
gcloud artifacts repositories create noir-backend \
  --repository-format=docker --location=$REGION

# 3. Create service account
echo "=== Creating service account ==="
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="Noir Backend Deployer"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

# 4. Create Workload Identity Federation
echo "=== Creating WIF pool + provider ==="
gcloud iam workload-identity-pools create github-pool --location=global

gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/${REPO}"

# 5. Create secrets (placeholders — update real values in console)
echo "=== Creating secrets ==="
for secret in DATABASE_URL MASTER_KEY_ID CHANNEL_SECRET_KEY ISSUER_ADDRESS \
  PDAX_API_KEY PDAX_SECRET_KEY PDAX_CLIENT_ID TERMINAL_ID; do
  echo -n "replace-me" | gcloud secrets create "$secret" --data-file=-
done

POOL_NAME=$(gcloud iam workload-identity-pools describe github-pool \
  --location=global --format="value(name)")

echo ""
echo "═══════════════════════════════════════════════════"
echo "Setup complete!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Add these to GitHub repo secrets:"
echo "  GCP_WORKLOAD_IDENTITY_PROVIDER: $POOL_NAME/providers/github-provider"
echo "  GCP_SERVICE_ACCOUNT: $SA_EMAIL"
echo ""
echo "Then update secret values in Google Secret Manager console"
echo "with real credentials before the first deploy."
