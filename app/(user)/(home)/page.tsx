import EndReached from "@/components/EndReached";
import HomeCategories from "../../../components/HomeCategories";
import HomePoster from "../../../components/HomePoster";
import RoboticsPartsSection from "../../../components/RoboticsPartsSection";

export default function Home() {
  return (
    <main className="bg-[#FFFFFF] min-h-screen">
      {/* <Navbar /> */}
      <HomePoster />
      <HomeCategories />
      <RoboticsPartsSection />
      <EndReached />
    </main>
  );
}
