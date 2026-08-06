import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
    Cpu,
    Radar,
    Bot,
    GraduationCap,
    BatteryCharging,
    Wrench,
    Plane,
    Component,
    Keyboard,
    Monitor,
    Headphones,
    Package, LucideProps
} from "lucide-react";
import CategoryImage from "@/components/Categoryimage";

const ACCENT = "#eab308";

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

async function getAllCategories(): Promise<Category[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/categories`, {
            cache: "no-store",
        });
        const json = await res.json();

        return json?.data || [];
    } catch (err) {
        console.error("Failed to fetch categories:", err);
        return [];
    }
}

export default async function CategoriesPage() {
    const categories = await getAllCategories();

    return (
        <main className="bg-white dark:bg-[#0a0a0a] min-h-screen">
            <Navbar />

            <section className="relative border-b border-gray-300 dark:border-[#232323]">
                <div className="grid md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr]">
                    <div className="hidden md:flex md:row-span-2 border-r border-gray-300 dark:border-[#232323] items-start px-6 py-16">
                        <span className="inline-flex items-center gap-2 font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60 border border-gray-300 dark:border-white/15 px-3 py-1.5">
                            <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
                            All Categories
                        </span>
                    </div>

                    <div className="md:hidden px-4 sm:px-6 pt-8 sm:pt-10">
                        <span className="inline-flex items-center gap-2 font-dm-sans text-xs uppercase tracking-widest text-gray-600 dark:text-white/60 border border-gray-300 dark:border-white/15 px-3 py-1.5">
                            <span style={{ color: ACCENT }} className="text-[10px]">▪</span>
                            All Categories
                        </span>
                    </div>

                    <div className="border-b border-gray-300 dark:border-[#232323] px-4 sm:px-6 md:px-16 py-8 sm:py-10 md:py-16">
                        <h1 className="font-oliveira text-[30px] sm:text-[38px] leading-[1.05] text-gray-900 dark:text-white md:text-[56px]">
                            Browse Every{" "}
                            <span className="font-dm-sans font-bold text-gray-700 dark:text-white/90">
                                CATEGORY
                            </span>
                        </h1>
                    </div>

                    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-16 md:py-20">
                        {categories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-10 sm:gap-y-14 md:gap-y-16 md:grid-cols-3">
                                {categories.map((category) => {
                                    const Icon = getIconForCategory(category.slug);

                                    return (
                                        <article key={category.id} className="group min-w-0">
                                            <div className="relative aspect-[1.45] overflow-hidden border border-gray-300 dark:border-[#232323] bg-gray-100 dark:bg-[#2A2A2A]">
                                                <span className="absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-black/30 dark:border-white/40 z-10" />
                                                <span className="absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-black/30 dark:border-white/40 z-10" />
                                                <span className="absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-black/30 dark:border-white/40 z-10" />
                                                <span className="absolute bottom-1.5 right-1.5 h-2 w-2 border-b border-r border-black/30 dark:border-white/40 z-10" />

                                                <CategoryImage
                                                    src={category.image}
                                                    alt={category.name}
                                                    fallback={
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Icon
                                                                size={56}
                                                                strokeWidth={1.5}
                                                                className="text-gray-500 dark:text-white/60 transition-transform duration-500 group-hover:scale-110 sm:hidden"
                                                            />
                                                            <Icon
                                                                size={72}
                                                                strokeWidth={1.5}
                                                                className="hidden text-gray-500 dark:text-white/60 transition-transform duration-500 group-hover:scale-110 sm:block"
                                                            />
                                                        </div>
                                                    }
                                                />
                                            </div>

                                            <div className="mt-4 sm:mt-6">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-6 min-w-0">
                                                    <h3
                                                        className="shrink-0 font-dm-sans text-sm font-bold uppercase tracking-[0.15em]"
                                                        style={{ color: ACCENT }}
                                                    >
                                                        {category.name}
                                                    </h3>

                                                    {category.description && (
                                                        <p className="min-w-0 sm:max-w-[180px] flex-1 text-left sm:text-right font-mono text-sm leading-6 text-gray-900 dark:text-white">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/products?categoryId=${category.id}&categoryName=${category.name}`}
                                                    className="mt-4 sm:mt-6 inline-flex items-center gap-3 bg-white dark:bg-[#0a0a0a] px-5 py-3 font-dm-sans text-[11px] font-semibold uppercase tracking-[0.25em] transition-all duration-300 hover:opacity-90"
                                                    style={{ color: ACCENT, border: `1px solid ${ACCENT}` }}
                                                >
                                                    <span className="h-2 w-2" style={{ backgroundColor: ACCENT }} />
                                                    Explore
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border border-dashed border-gray-300 dark:border-white/15 py-16 sm:py-20 px-4 text-center">
                                <p className="font-dm-sans text-gray-400 dark:text-white/40">
                                    No categories available right now.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}