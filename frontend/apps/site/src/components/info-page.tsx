import Link from "@/lib/navigation";
import PublicShell from "./public-shell";
import { infoPages } from "@/lib/public-content";
import { business } from "@/lib/business";
export default function InfoPage({ slug }: { slug: keyof typeof infoPages }) {
  const data = infoPages[slug];
  return (
    <PublicShell>
      <main id="main" className="content-page">
        <nav className="breadcrumbs tw:mt-[35px] tw:text-[#6e7e63] tw:text-[13px]">
          <Link href="/">خانه</Link>
          <span> / {data.title}</span>
        </nav>
        <section className="content-hero">
          <span className="eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <h2>{data.lead}</h2>
          <p>{data.intro}</p>
        </section>
        {slug === "about" && (
          <img
            className="tw:h-90 tw:rounded-[18px] tw:below-600:h-57.5 tw:block tw:w-full tw:object-cover tw:[margin:0_0_36px]"
            src="/alamut-road.jpg"
            alt="مسیر کوهستانی حمل بار"
            width={1200}
            height={600}
          />
        )}
        <div className="tw:grid tw:grid-cols-2 tw:gap-6 tw:below-600:grid-cols-[1fr]">
          {slug === "terms" && business.terms && (
            <section className="card info-card">
              <h2>شرایط بهره‌بردار</h2>
              <p>{business.terms}</p>
            </section>
          )}
          {data.sections.map((section, i) => (
            <section className="card info-card" key={section.title}>
              <span className="section-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
        <section className="content-cta tw:border-t tw:border-t-line tw:below-600:items-stretch tw:mt-12 tw:pt-8 tw:flex tw:items-center tw:gap-4.5 tw:flex-wrap">
          <h2>قدم بعدی را با هم روشن کنیم.</h2>
          <Link className="btn" href="/contact">
            گفت‌وگو درباره همکاری
          </Link>
          <Link className="secondary-btn" href="/help">
            راهنمای پنل‌ها
          </Link>
        </section>
      </main>
    </PublicShell>
  );
}
