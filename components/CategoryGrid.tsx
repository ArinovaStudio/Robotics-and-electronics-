import Link from "next/link";
import { Bell, LucideProps, Package, Keyboard, Monitor, Headphones } from "lucide-react";
import {
  Cpu,
  Radar,
  Bot,
  GraduationCap,
  BatteryCharging,
  Wrench,
  Plane,
  Component,
} from "lucide-react";

import CategoryImage from "./Categoryimage";

const ACCENT = "#ff5a1f";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  "small-dev-boards": Cpu,
  sensors: Radar,
  "robotics-motors--wheels": Bot,
  "beginner--basic-electronics-kits": GraduationCap,
  "power-supply": BatteryCharging,
  "diy-projects-kits": Wrench,
  drones: Plane,
  modules: Component,
  "mice-keyboards": Keyboard,
  "monitors-displays": Monitor,
  "headsets-audio-gear": Headphones,
};

function getIconForCategory(slug: string): React.ComponentType<LucideProps> {
  return ICON_MAP[slug] || Package;
}

async function getHomeCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories?isHome=true`,
      { cache: "no-store" }
    );

    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

export default async function CategoryGrid() {
  const categories = await getHomeCategories();

  return (
    <section
      id="categories"
      className="relative border-t border-b border-gray-300 dark:border-white/10 scroll-mt-24 bg-white dark:bg-transparent"
    >
      {/* Sidebar now spans the FULL section height via grid-rows + row-span-2,
          instead of only wrapping the header row */}
      <div className="grid md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr]">
        {/* Sidebar */}
        <aside className="border-b md:border-b-0 md:border-r border-gray-300 dark:border-white/10 px-6 py-10 md:py-16 md:row-span-2">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-[#1c1c1c] px-4 py-2.5">
            <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-white/60" />
            <span className="font-dm-sans text-[11px] uppercase tracking-[0.25em] text-gray-600 dark:text-white/60">
              Categories
            </span>
          </div>
        </aside>

        {/* Header content */}
        <div className="border-b border-gray-300 dark:border-white/10 px-6 md:px-16 py-10 md:py-16">
          <h2 className="font-oliveira text-[38px] leading-[1.05] text-gray-900 dark:text-white md:text-[56px]">
            Find the Perfect{" "}
            <span className="font-dm-sans font-bold text-gray-700 dark:text-white/90">
              PRODUCT
            </span>{" "}
            for Your Needs
          </h2>
        </div>

        {/* Cards + banner — now inside the same grid column as the header,
            so its left edge aligns with the heading, not the page edge */}
        <div className="px-6 md:px-16 py-16 md:py-20">
          {categories.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {categories.map((category) => {
                  const Icon = getIconForCategory(category.slug);

                  return (
                    <article key={category.id} className="group flex min-w-0 flex-col">
                      <div className="relative aspect-[1.45] overflow-hidden border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-[#2A2A2A]">
                        <span className="absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-black/30 dark:border-white/40" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-black/30 dark:border-white/40" />
                        <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-black/30 dark:border-white/40" />
                        <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-black/30 dark:border-white/40" />

                        <CategoryImage
                          src={category.image}
                          alt={category.name}
                          fallback={
                            <div className="flex h-full w-full items-center justify-center">
                              <Icon
                                size={48}
                                strokeWidth={1.5}
                                className="text-gray-500 dark:text-white/60 transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-1 flex-col">
                        <h3
                          className="line-clamp-1 font-dm-sans text-xs font-bold uppercase tracking-[0.1em] text-black dark:text-white"
                        >
                          {category.name}
                        </h3>

                        <Link
                          href={`/products?category=${category.slug}`}
                          className="mt-auto inline-flex w-fit items-center gap-2 bg-white dark:bg-[#0a0a0a] py-2 font-dm-sans text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:opacity-90"
                          style={{ color: ACCENT }}
                        >
                          <span className="h-1.5 w-1.5" style={{ backgroundColor: ACCENT }} />
                          Explore
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-24 mx-auto flex max-w-3xl flex-col gap-4 bg-gray-100 dark:bg-[#1c1c1c] px-8 py-5 md:flex-row md:items-center md:justify-between">
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  We are Introducing Some Fresh Concept Soon!
                </p>

                <div
                  className="flex items-center gap-2 font-dm-sans text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: ACCENT }}
                >
                  <Bell size={15} />
                  Stay Notified
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center border border-dashed border-gray-300 dark:border-white/15 py-20">
              <p className="font-dm-sans text-gray-400 dark:text-white/40">
                No categories available right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}