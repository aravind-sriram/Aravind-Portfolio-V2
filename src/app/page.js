import Hero from "@/components/Hero/Hero";
import Loader from "@/components/Loader/Loader";
import Works from "@/components/Works/Works";

export default function Home() {
  return (
    <>
      <Loader />
      <Hero />
      <Works />
    </>
  );
}
