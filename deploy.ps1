# VenueIQ Deployment Script
# Ensure you are logged in: gcloud auth login && firebase login

$PROJECT_ID = "venueiq-493915"
$DEPLOY_ACCOUNT = "damordevashish85@gmail.com"
$REGION = "us-central1"

# Check active account
$currentAccount = gcloud config get-value account
if ($currentAccount -ne $DEPLOY_ACCOUNT) {
    Write-Host "[WARNING] Active account is $currentAccount, but you specified $DEPLOY_ACCOUNT." -ForegroundColor Yellow
    Write-Host "Please run: gcloud config set account $DEPLOY_ACCOUNT" -ForegroundColor Cyan
}

Write-Host "[START] Starting Deployment for VenueIQ..." -ForegroundColor Cyan

# 1. Backend (Cloud Run)
Write-Host "[BACKEND] Building and deploying Backend to Cloud Run..." -ForegroundColor Yellow
cd backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/backend --project $PROJECT_ID
gcloud run deploy backend `
    --image gcr.io/$PROJECT_ID/backend `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --project $PROJECT_ID

$BACKEND_URL = gcloud run services describe backend --platform managed --region $REGION --format='value(status.url)' --project $PROJECT_ID
Write-Host "[SUCCESS] Backend deployed at: $BACKEND_URL" -ForegroundColor Green

# 2. Frontend (Firebase Hosting)
Write-Host "[FRONTEND] Deploying Frontends to Firebase Hosting..." -ForegroundColor Yellow
cd ..

# Apply targets if not already set
firebase target:apply hosting web venueiq-dashboard --project $PROJECT_ID
firebase target:apply hosting mobile venueiq-mobile --project $PROJECT_ID

# Build and Deploy
cd web
pnpm install; pnpm run build
cd ../mobile
pnpm install; pnpm run build
cd ..

firebase deploy --only hosting --project $PROJECT_ID

Write-Host "[FINISH] Deployment Complete!" -ForegroundColor Cyan
