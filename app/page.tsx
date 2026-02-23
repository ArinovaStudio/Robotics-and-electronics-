import Image from "next/image";
import Navbar from "../components/Navbar";
import HomePoster from "../components/HomePoster";
import HomeCategories from "../components/HomeCategories";
import RoboticsPartsSection from "../components/RoboticsPartsSection";
import Footer from "@/components/Footer";
import EndReached from "@/components/EndReached";

export default function Home() {
  return (
    <main className=" bg-[#FFFFFF] min-h-screen">
      {/* <Navbar /> */}
      <HomePoster />
      <HomeCategories />
      <RoboticsPartsSection />
      <EndReached />
    </main>
  );
}
