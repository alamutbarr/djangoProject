import { ArrowUpLeft } from "lucide-react";
import { Brand } from "@/components/ui";
import Link from "@/lib/navigation";

const footerGroups = [
  {
    title: "آشنایی با الموت",
    links: [
      ["/services", "خدمات حمل‌ونقل"],
      ["/how-it-works", "روش همکاری"],
      ["/about", "درباره ما"],
      ["/articles", "مقالات"],
    ],
  },
  {
    title: "پیگیری و پشتیبانی",
    links: [
      ["/tracking", "پیگیری بار"],
      ["/help", "راهنمای پنل‌ها"],
      ["/faq", "پرسش‌های متداول"],
      ["/contact", "تماس با ما"],
    ],
  },
];

const footerHover =
  "tw:hover:text-white tw:hover:underline tw:hover:underline-offset-[0.25em]";
const footerLink =
  "tw:inline-flex tw:min-h-9.5 tw:items-center tw:py-1 tw:text-public-label tw:text-[#d5e4dd] tw:below-760:min-h-11";
const footerBottomLink =
  "tw:inline-flex tw:min-h-9.5 tw:items-center tw:py-1 tw:text-public-note tw:text-[#d5e4dd] tw:below-760:min-h-11";

export default function PublicFooter() {
  return (
    <footer className="site-footer tw:bg-[#173f3c] tw:px-(--public-gutter) tw:text-[#f4f6ee]">
      <div className="tw:mx-auto tw:max-w-[1160px] tw:pt-[clamp(2rem,5vw,3.75rem)]">
        <div className="tw:grid tw:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,1fr))] tw:gap-[clamp(1rem,4vw,3.25rem)] tw:below-760:grid-cols-2">
          <div className="tw:flex tw:flex-col tw:items-start tw:gap-[1.125rem] tw:below-760:col-span-full">
            <Brand light />
            <Link
              className={`${footerHover} tw:inline-flex tw:min-h-11 tw:items-center tw:gap-2 tw:rounded-[8px] tw:border tw:border-[#82a39a] tw:px-[0.875rem] tw:py-[0.375rem] tw:text-public-label tw:font-semibold`}
              href="/apps"
            >
              ورود به پنل‌ها و نصب برنامه <ArrowUpLeft size={17} />
            </Link>
          </div>
          {footerGroups.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <h2 className="tw:mb-1.5 tw:text-public-body tw:font-bold tw:text-[#f4f6ee]">
                {title}
              </h2>
              <ul className="tw:m-0 tw:list-none tw:p-0">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link
                      className={`${footerLink} ${footerHover}`}
                      href={href}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="tw:mt-[1.5rem] tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-[1.5rem] tw:gap-y-[0.5rem] tw:border-t tw:border-[#ffffff40] tw:py-[0.75rem] tw:below-560:flex-col tw:below-560:items-start">
          <small className="tw:text-public-note tw:text-[#d5e4dd]">
            © {new Date().toLocaleDateString("fa-IR", { year: "numeric" })}{" "}
            الموت
          </small>
          <nav
            aria-label="حقوق کاربران و وضعیت سامانه"
            className="tw:flex tw:flex-wrap tw:gap-y-0 tw:gap-x-4"
          >
            <Link
              className={`${footerBottomLink} ${footerHover}`}
              href="/privacy"
            >
              حریم خصوصی
            </Link>
            <Link
              className={`${footerBottomLink} ${footerHover}`}
              href="/terms"
            >
              شرایط استفاده
            </Link>
            <Link
              className={`${footerBottomLink} ${footerHover}`}
              href="/security"
            >
              امنیت داده
            </Link>
            <Link
              className={`${footerBottomLink} ${footerHover}`}
              href="/status"
            >
              وضعیت سرویس
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
