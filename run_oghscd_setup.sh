#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

REPO_URL="https://github.com/Joysilas389/oghscd-data-tracker.git"
BASE_DIR="$HOME/Download/OpenEBM-repo"
REPO_DIR="$BASE_DIR/oghscd-data-tracker"

echo "==> Preparing folders..."
mkdir -p "$BASE_DIR"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "==> Cloning repository..."
  git clone "$REPO_URL" "$REPO_DIR"
else
  echo "==> Repository already exists, using local copy..."
fi

cd "$REPO_DIR"

echo "==> Fetching latest refs..."
git fetch --all --prune

echo "==> Detecting branch..."
if git show-ref --verify --quiet refs/remotes/origin/work; then
  TARGET_BRANCH="work"
else
  TARGET_BRANCH="main"
fi
echo "==> Using branch: $TARGET_BRANCH"

git checkout "$TARGET_BRANCH"
git pull origin "$TARGET_BRANCH"

echo "==> Current remote branches:"
git branch -r || true

echo "==> Checking project files..."
if [ ! -f "package.json" ]; then
  echo ""
  echo "ERROR: package.json not found."
  echo "This means full app code is not yet in GitHub branch '$TARGET_BRANCH'."
  echo "Ask to push the full project branch, then re-run this script."
  exit 1
fi

echo "==> Setting up .env ..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Copied .env.example -> .env"
  else
    cat > .env <<'EOV'
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
APP_URL="http://localhost:3000"
SESSION_SECRET="replace-with-long-random-secret"
FIELD_ENCRYPTION_KEY="replace-with-32-byte-key"
PATIENT_CODE_PREFIX="OGH-SCD"
EOV
    echo "Created fallback .env template (please edit values)."
  fi
fi

echo "==> Installing dependencies..."
npm install

echo "==> Running optional DB scripts if available..."
if npm run | grep -q "db:generate"; then npm run db:generate; else echo "skip db:generate"; fi
if npm run | grep -q "db:migrate";  then npm run db:migrate;  else echo "skip db:migrate";  fi
if npm run | grep -q "db:seed";     then npm run db:seed;     else echo "skip db:seed";     fi

echo ""
echo "==> Setup complete."
echo "If needed, edit env now: nano .env"
echo "Starting dev server..."
npm run dev
