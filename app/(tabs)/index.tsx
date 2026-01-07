import React from 'react';
import WebViewScreen from '@/components/WebViewScreen';
import { useAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  // Hide landing page for signed-in users, show marketplace instead
  const routePath = isSignedIn ? "/marketplace" : "/";

  return <WebViewScreen routePath={routePath} />;
}
