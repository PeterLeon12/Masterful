// Redirect to enhanced onboarding
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function ProfessionalOnboardingScreen() {
  useEffect(() => {
    // Redirect to enhanced onboarding
    router.replace('/professional/onboarding-enhanced');
  }, []);

  return null;
}