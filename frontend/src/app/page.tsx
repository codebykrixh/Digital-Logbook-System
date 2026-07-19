import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Clients } from '@/components/landing/clients';
import { Features } from '@/components/landing/features';
import { Modules } from '@/components/landing/modules';
import { Analytics } from '@/components/landing/analytics';
import { Stats } from '@/components/landing/stats';
import { Security } from '@/components/landing/security';
import { Testimonials } from '@/components/landing/testimonials';
import { Pricing } from '@/components/landing/pricing';
import { Faq } from '@/components/landing/faq';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Clients />
        <Features />
        <Modules />
        <Analytics />
        <Stats />
        <Security />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
