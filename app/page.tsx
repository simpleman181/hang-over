import { Hero } from "@/components/hero"
import { ProjectsSection } from "@/components/projects-section"
import { RandomFact } from "@/components/random-fact"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <ProjectsSection />
      <RandomFact />
      <ContactSection />
      <Footer />
    </main>
  )
}
