import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="empty tw:py-[55px] tw:px-[25px] tw:flex tw:items-center tw:flex-col tw:justify-center tw:min-h-55 tw:text-center tw:text-[#9baa91]">
      <h1>این مسیر پیدا نشد.</h1>
      <p>ممکن است آدرس تغییر کرده باشد.</p>
      <p>
        <Link href="/apps">ورود به پنل‌ها</Link> ·{" "}
        <Link href="/articles">مقالات</Link> ·{" "}
        <Link href="/contact">پشتیبانی</Link>
      </p>
      <Link className="btn" href="/">
        بازگشت به خانه
      </Link>
    </main>
  );
}
