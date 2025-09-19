#!/bin/bash

echo "🚀 MASTERFUL MOBILE APP SETUP"
echo "=============================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

echo "✅ EAS CLI is ready"
echo ""

# Check if user is logged in
echo "🔐 Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

echo "✅ EAS authentication ready"
echo ""

# Set up Stripe keys
echo "💳 STRIPE SETUP"
echo "==============="
echo "To get your Stripe keys:"
echo "1. Go to https://dashboard.stripe.com/test/apikeys"
echo "2. Copy your 'Publishable key' (starts with pk_test_)"
echo "3. Copy your 'Secret key' (starts with sk_test_)"
echo ""

read -p "Enter your Stripe Publishable Key (pk_test_...): " STRIPE_PK
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_SK

if [ -z "$STRIPE_PK" ] || [ -z "$STRIPE_SK" ]; then
    echo "❌ Stripe keys are required. Exiting..."
    exit 1
fi

echo "✅ Stripe keys received"
echo ""

# Set environment variables
echo "🔧 Setting up environment variables..."
export EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="$STRIPE_PK"
export STRIPE_SECRET_KEY="$STRIPE_SK"

# Update environment file
echo "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK" >> .env
echo "STRIPE_SECRET_KEY=$STRIPE_SK" >> .env

echo "✅ Environment variables set"
echo ""

# Build options
echo "📱 BUILD OPTIONS"
echo "==============="
echo "1. Build for Android (Preview)"
echo "2. Build for iOS (Preview)"
echo "3. Build for both platforms (Preview)"
echo "4. Build for production (App Store/Google Play)"
echo ""

read -p "Choose build option (1-4): " BUILD_OPTION

case $BUILD_OPTION in
    1)
        echo "🤖 Building for Android..."
        eas build --platform android --profile preview
        ;;
    2)
        echo "🍎 Building for iOS..."
        eas build --platform ios --profile preview
        ;;
    3)
        echo "📱 Building for both platforms..."
        eas build --platform all --profile preview
        ;;
    4)
        echo "🏪 Building for production..."
        eas build --platform all --profile production
        ;;
    *)
        echo "❌ Invalid option. Exiting..."
        exit 1
        ;;
esac

echo ""
echo "🎉 Build process started!"
echo "Check your build status at: https://expo.dev/accounts/peterleoo/projects/romanian-marketplace-app"
echo ""
echo "📱 Your app will be available for download once the build completes."
echo "You can install it on your device using the QR code or download link provided."
