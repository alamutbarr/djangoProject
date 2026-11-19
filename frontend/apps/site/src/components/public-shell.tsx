import Link from "@/lib/navigation";
import { Brand } from "@/components/ui";
import PublicFooter from "./public-footer";
import PublicMobileNav from "./public-mobile-nav";
import type { ReactNode } from "react";
export const publicLinks = [
  ["/about", "درباره ما"],
  ["/services", "خدمات"],
  ["/how-it-works", "روش همکاری"],
  ["/articles", "مقالات"],
  ["/faq", "پرسش‌ها"],
  ["/tracking", "پیگیری بار"],
  ["/contact", "تماس با ما"],
];
export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site mobile-public">
      <header className="site-header tw:max-w-[1320px] tw:m-auto tw:py-6 tw:px-8 tw:flex tw:items-center tw:gap-7 tw:border-b tw:border-b-line tw:pt-[max(20px,env(safe-area-inset-top))] tw:below-1100:gap-4.5 tw:below-1100:px-6 tw:below-850:justify-between tw:below-850:relative">
        <Brand />
        <nav aria-label="صفحات عمومی">
          {publicLinks.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="secondary-btn" href="/apps">
          پنل‌ها و نصب برنامه
        </Link>
        <details className="site-mobile-menu tw:hidden tw:below-850:block">
          <summary>منوی سایت</summary>
          <nav aria-label="منوی موبایل سایت">
            {publicLinks.map(([href, label]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
            <Link href="/apps">نصب پنل‌ها</Link>
          </nav>
        </details>
      </header>
      {children}
      <PublicFooter />
      <PublicMobileNav />
    </div>
  );
}
