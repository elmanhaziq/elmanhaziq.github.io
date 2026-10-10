import { Hero } from "@/components/hero/Hero";
import { About, Contact, Lifecycle, Systems, Work } from "@/components/sections/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Lifecycle />
      <Work />
      <Systems />
      <About />
      <Contact />
    </>
  );
}
