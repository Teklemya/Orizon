import HomeNavbar from "../components/home/HomeNavbar";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import PlatformPreviewSection from "../components/home/PlatformPreviewSection";
import WhyOrizonSection from "../components/home/WhyOrizonSection";
import CommunitySection from "../components/home/CommunitySection";
import CTASection from "../components/home/CTASection";
import HomeFooter from "../components/home/HomeFooter";

/**
 * Public-facing marketing homepage.
 *
 * This page has its own layout (Navbar + Footer) and does NOT use
 * the internal app Layout component. It is served at the root "/" route
 * and is publicly accessible before login.
 *
 * Authenticated users who hit "/" are redirected to "/dashboard"
 * via App.tsx routing logic.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <HomeNavbar />

      <main>
        {/* 1. Hero — what Orizon is and who it's for */}
        <HeroSection />

        {/* 2. Features — the four core tools */}
        <FeaturesSection />

        {/* 3. How It Works — simple 4-step onboarding flow */}
        <HowItWorksSection />

        {/* 4. Platform Preview — teaser of the private workspace */}
        <PlatformPreviewSection />

        {/* 5. Why Orizon — differentiators and narrative */}
        <WhyOrizonSection />

        {/* 6. Community & Mission — trust and belonging */}
        <CommunitySection />

        {/* 7. Final CTA — conversion push */}
        <CTASection />
      </main>

      <HomeFooter />
    </div>
  );
}
