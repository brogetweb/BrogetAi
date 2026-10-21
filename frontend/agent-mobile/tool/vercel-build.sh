#!/usr/bin/env bash
set -euo pipefail

if ! command -v flutter >/dev/null 2>&1; then
  git clone https://github.com/flutter/flutter.git --depth 1 -b stable "$HOME/flutter"
  export PATH="$HOME/flutter/bin:$PATH"
fi

flutter config --enable-web --no-analytics
flutter pub get
flutter build web --release --dart-define="API_BASE=${API_BASE:-http://localhost:3000/api/v1}"
