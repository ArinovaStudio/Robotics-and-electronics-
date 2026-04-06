import Link from "next/link";
import { Wrench, Zap, Users, Rocket, ChevronRight, Flame, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen font-sans selection:bg-[#f0b31e] selection:text-[#050a30]">
      
      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-20 bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1000px] mx-auto text-center space-y-6">
          
          <h1 className="text-sm md:text-base font-black text-[#f0b31e] uppercase tracking-widest mb-2">
            About Us
          </h1>
          
          <h2 className="text-5xl md:text-7xl font-black text-[#050a30] tracking-tighter leading-[1.05] uppercase">
            We didn’t start this company to sell components.
          </h2>
          <p className="text-2xl md:text-4xl font-bold text-gray-500 tracking-tight mt-6">
            We started it because the system is <span className="text-[#f0b31e] underline decoration-4 underline-offset-8">broken.</span>
          </p>
        </div>
      </section>

      {/* 2. THE DISCONNECT (The Problem) */}
      <section className="py-20 md:py-32 w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-[#050a30] tracking-tight uppercase">The Disconnect</h2>
            <p className="text-xl leading-relaxed text-gray-600 font-medium">
              Engineering students spend years studying theory… but when it’s time to build something real, they’re stuck.
            </p>
            <ul className="space-y-4 text-lg text-[#050a30] font-bold">
              <li className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="w-3 h-3 rounded-full bg-[#f0b31e] shadow"></span>
                They don’t know what to buy.
              </li>
              <li className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="w-3 h-3 rounded-full bg-[#f0b31e] shadow"></span>
                They don’t know how to build.
              </li>
              <li className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span className="w-3 h-3 rounded-full bg-[#f0b31e] shadow"></span>
                Worst of all—they don’t know who to ask.
              </li>
            </ul>
          </div>

          <div className="bg-[#050a30] rounded-[20px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#f0b31e]" />
            <p className="text-xl leading-relaxed text-gray-300">
              At the same time, there are skilled engineers out there—talented, capable—but underpaid, underutilized, and invisible.
            </p>
            <p className="text-3xl font-black text-white mt-8 tracking-tight">
              That didn’t make sense to us. <br/>
              <span className="text-[#f0b31e]">So we built something different.</span>
            </p>
          </div>
        </div>
      </section>

      {/* WHAT WE'RE BUILDING (The Ecosystem) */}
      <section className="py-20 md:py-32 bg-gray-50 border-y border-gray-200">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black text-[#050a30] tracking-tight mb-6 uppercase">
              TSquarey + Tech Engi
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Not just a store. Not just a marketplace. It’s a <strong className="text-[#050a30] bg-[#f0b31e]/20 px-2 py-1 rounded">complete engineering ecosystem</strong>. You want to build something? We’ve got the components. We’ve got the kits. We’ve got the experts. No confusion. No guesswork. No wasted time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Wrench, title: "Buy", desc: "Get exactly what you need. No more guessing." },
              { icon: Zap, title: "Build", desc: "Bring your raw imagination to life." },
              { icon: Users, title: "Connect", desc: "Get expert help the moment you’re stuck." },
              { icon: Rocket, title: "Finish", desc: "Actually complete your project." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 p-8 rounded-[20px] shadow-sm hover:shadow-lg hover:border-[#f0b31e] transition-all duration-300 group">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#f0b31e] transition-colors">
                  <item.icon className="w-7 h-7 text-[#050a30] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#050a30] mb-3 uppercase">{item.title}</h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WE EXIST & DIFFERENCE */}
      <section className="py-20 md:py-32 w-full max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Column */}
          <div className="space-y-10">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-[#f0b31e] uppercase tracking-widest mb-6">
                <Target size={24} /> Why We Exist
              </h2>
              <ul className="space-y-6 text-2xl text-[#050a30] font-black tracking-tight">
                <li className="border-b border-gray-200 pb-4">Students deserve <span className="text-[#f0b31e]">real skills</span>, not just marks.</li>
                <li className="border-b border-gray-200 pb-4">Builders deserve <span className="text-[#f0b31e]">tools that actually work</span>.</li>
                <li className="border-b border-gray-200 pb-4">Engineers deserve <span className="text-[#f0b31e]">a way to earn</span> from their skills.</li>
              </ul>
              <p className="mt-8 text-xl text-gray-600 font-medium">We’re here to remove friction. To make building faster, cheaper, and accessible.</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            <div className="bg-[#050a30] p-10 rounded-[20px] shadow-lg text-white">
              <h3 className="text-2xl font-black tracking-tight mb-6 uppercase border-b border-white/20 pb-4">
                What Makes Us Different
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed font-medium mb-6">
                We don’t follow the old playbook.
              </p>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-[#f0b31e] font-bold">X</span>
                  E-commerce platforms sell products—but don’t help you use them.
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#f0b31e] font-bold">X</span>
                  Freelance platforms offer services—but don’t understand engineering.
                </li>
              </ul>
              <p className="text-2xl font-black text-[#f0b31e] leading-tight">
                We do both. And we connect them. <br/><span className="text-white">That’s the difference.</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* BELIEFS MARQUEE / BANNER */}
      <section className="bg-[#f0b31e] py-16 overflow-hidden">
        <div className="w-full max-w-[1200px] mx-auto px-4">
          <h2 className="text-center text-[#050a30] font-black text-3xl md:text-4xl uppercase mb-10 tracking-tight">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Learning happens by building, not watching",
              "Speed matters more than perfection",
              "Execution beats theory",
              "Access should not be a privilege"
            ].map((belief, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur text-[#050a30] p-6 rounded-lg font-black text-xl flex items-center gap-4 shadow-sm">
                <Flame className="text-[#f0b31e] shrink-0" size={28} />
                {belief}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIGGER PICTURE & FINAL CTA */}
      <section className="py-24 md:py-32 bg-white text-center">
        <div className="w-full max-w-[900px] mx-auto px-4 space-y-16">
          
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-[#050a30] tracking-tight uppercase">The Bigger Picture</h2>
            <p className="text-2xl text-gray-600 font-medium leading-relaxed">
              We’re not just solving student problems. We’re building a system where ideas turn into projects, projects turn into skills, skills turn into income, and eventually—into <strong className="text-[#050a30]">startups, products, and real innovation.</strong>
            </p>
          </div>

          <div className="pt-16 border-t border-gray-200 space-y-8">
            <h2 className="text-5xl md:text-7xl font-black text-[#050a30] tracking-tighter uppercase leading-none">
              This is not just a platform.
            </h2>
            <p className="text-3xl md:text-4xl text-[#f0b31e] tracking-tight font-black pb-8">
              This is where engineers stop consuming… and start creating.
            </p>
            
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center gap-3 bg-[#0a0f3c] text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-[#050a30] hover:shadow-xl transition-all duration-300"
            >
              Start Creating <ChevronRight size={24} />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}