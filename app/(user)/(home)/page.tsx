import CertificationsStrip from "@/components/CertificationsStrip";
import EndReached from "@/components/EndReached";
import HomeCategories from "@/components/HomeCategories";
import HomePoster from "@/components/HomePoster";
import RoboticsPartsSection from "@/components/RoboticsPartsSection";
import TechEngi from "@/components/TechEngi";

export default function Home() {
  return (
    <main className="bg-[#FFFFFF] min-h-screen">
      {/* <Navbar /> */}
      <HomePoster />
      <TechEngi />
      <HomeCategories />
      <RoboticsPartsSection />
      <EndReached />
      <CertificationsStrip />
    </main>
  );
}
