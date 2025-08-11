import { Header } from "@/app/_components/header";
import { HeroSection } from "@/app/_components/hero-section";
import { FeaturesSection } from "@/app/_components/features-section";
import { SecuritySection } from "@/app/_components/security-section";
import { CallToActionSection } from "@/app/_components/call-to-action-section";
import { Footer } from "@/app/_components/footer";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <SecuritySection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
