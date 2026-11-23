"use client";
import { api, number, roles, type Role } from "@/lib/api";
import { appHref } from "@/lib/deployment-links";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpLeft,
  CheckCircle2,
  Layers3,
  MapPin,
  Menu,
  PackageCheck,
  PanelsTopLeft,
  Route,
  Search,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import Link from "@/lib/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Badge, Brand, Modal } from "@/components/ui";
import PublicFooter from "./public-footer";
import PublicMobileNav from "./public-mobile-nav";
const services = [
  {
    icon: Route,
    title: "پیگیری شفاف محموله",
    text: "وضعیت بار و تاریخچه مراحل حمل را در یک صفحه دنبال کنید؛ از تأیید سفارش تا تحویل نهایی.",
    note: "هر مرحله، روشن و قابل پیگیری",
  },
  {
    icon: ShieldCheck,
    title: "بازرسی در مبدأ و مقصد",
    text: "چک‌لیست بسته‌بندی، وزن، خودرو و شماره پلمب؛ هر تأیید با نام متصدی و زمان ثبت می‌شود.",
    note: "اطمینان از سلامت بار",
  },
  {
    icon: PackageCheck,
    title: "اسناد در کنار محموله",
    text: "تصاویر، رسید و مدارک حمل را کنار همان سفارش نگه دارید و در زمان لازم دریافت کنید.",
    note: "جزئیات، در جای درست",
  },
  {
    icon: Truck,
    title: "تأمین و تخصیص ناوگان",
    text: "پیشنهاد رانندگان را بررسی کنید. خودروی متناسب با وزن و نوع بار به مسیر شما تخصیص می‌یابد.",
    note: "خودروی درست برای بار درست",
  },
  {
    icon: Layers3,
    title: "مالی روشن و منظم",
    text: "کرایه توافق‌شده، صورتحساب و مرجع تسویه؛ یک تصویر روشن از حساب هر محموله.",
    note: "شفافیت تا آخرین مرحله",
  },
  {
    icon: PanelsTopLeft,
    title: "چهار نقش، یک مسیر",
    text: "صاحب بار، راننده، اپراتور و متصدی، هر کدام ابزارهای متناسب با کار خود را در اختیار دارند.",
    note: "هماهنگی در یک سامانه",
  },
];
const sectionHeading = "tw:text-public-title tw:leading-[1.55]";
const sectionText = "tw:text-public-body tw:leading-[2]";
const editorialGrid =
  "tw:grid tw:[align-items:start] tw:grid-cols-[1.15fr_1fr] tw:gap-25 tw:below-1200:gap-15 tw:below-950:gap-10 tw:below-760:grid-cols-1 tw:below-760:gap-7.5";
const heroBackdrop = "tw:absolute tw:inset-0 tw:size-full";

function SectionKicker({
  index,
  light = false,
  children,
}: {
  index: string;
  light?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        "tw:mb-[45px] tw:flex tw:items-center tw:gap-3.5 tw:text-public-label tw:font-medium tw:below-760:mb-7.5" +
        (light ? " tw:text-[#b9d0c9]" : "")
      }
    >
      <span
        className={`tw:h-px tw:w-6.5 ${light ? "tw:bg-[#74b5ae]" : "tw:bg-brand"}`}
      />
      {children}
      <small className="tw:mr-auto tw:text-public-note tw:text-[#556b60]">
        / {index}
      </small>
    </div>
  );
}

export default function Home() {
  const [entry, setEntry] = useState(false),
    [menu, setMenu] = useState(false),
    [sent, setSent] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tracking, setTracking] = useState<{
      code: string;
      origin: string;
      destination: string;
      status: string;
    } | null>(null),
    [trackError, setTrackError] = useState("");
  async function contact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = Object.fromEntries(new FormData(e.currentTarget));
      const result = await api<{ detail: string }>("contact/", "POST", d);
      setSent(result.detail);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function track(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTrackError("");
    setTracking(null);
    const d = new FormData(e.currentTarget);
    try {
      setTracking(
        await api(
          "tracking/?code=" + encodeURIComponent(String(d.get("code"))),
        ),
      );
    } catch {
      setTrackError("محموله‌ای با این کد پیدا نشد. کد پیگیری را بررسی کنید.");
    }
  }
  return (
    <div className="public-site mobile-public">
      <main id="main" className="landing-main">
        <section
          id="top"
          className="tw:relative tw:grid tw:min-h-[min(49rem,100svh)] tw:grid-rows-[auto_1fr_auto] tw:overflow-hidden tw:bg-[#183c3c] tw:text-[#f9f8ef] tw:below-760:min-h-[min(42rem,100svh)]"
        >
          <img
            className={`${heroBackdrop} tw:object-cover tw:object-[center_47%] tw:below-760:object-[59%_center]`}
            fetchPriority="high"
            width={1920}
            height={1080}
            src="/alamut-road.jpg"
            alt="کامیون در جاده کوهستانی، هنگام سپیده‌دم"
          />
          <div
            className={`${heroBackdrop} tw:bg-landing-hero tw:below-760:bg-landing-hero-mobile`}
          />
          <header className="tw:relative tw:z-2 tw:mx-auto tw:flex tw:w-full tw:max-w-[1220px] tw:items-center tw:justify-between tw:px-(--public-gutter) tw:py-6 tw:below-760:py-5.5 tw:below-760:[&_.brand]:min-w-[130px]">
            <Brand light />
            <nav
              aria-label="منوی اصلی"
              className={
                "public-nav tw:flex tw:items-center tw:gap-11 tw:text-public-label tw:text-[#e9ede7d1] tw:below-1200:gap-7" +
                (menu
                  ? " tw:below-760:absolute tw:below-760:inset-x-[15px] tw:below-760:top-[83px] tw:below-760:z-20 tw:below-760:max-h-[min(70dvh,28rem)] tw:below-760:flex-col tw:below-760:items-stretch tw:below-760:gap-2.5 tw:below-760:overflow-auto tw:below-760:rounded-[9px] tw:below-760:border tw:below-760:border-[#6f9183] tw:below-760:bg-[#173f3c] tw:below-760:p-[25px] tw:below-760:shadow-[0_18px_40px_#0c2428cc] tw:below-760:[&>a]:min-h-11 tw:below-760:[&>a]:p-2.5 tw:below-760:[&>button]:min-h-11"
                  : " tw:below-760:hidden")
              }
            >
              {[
                ["خدمات ما", "#services"],
                ["روش کار", "#approach"],
                ["شبکه حمل", "#network"],
                ["تماس با ما", "#contact"],
              ].map(([t, h]) => (
                <a
                  key={h}
                  href={h}
                  className="tw:hover:text-white"
                  onClick={() => setMenu(false)}
                >
                  {t}
                </a>
              ))}
              <button
                className="outline-btn tw:gap-4 tw:px-4 tw:py-2.5"
                onClick={() => {
                  setMenu(false);
                  setEntry(true);
                }}
              >
                ورود <ArrowUpLeft size={16} />
              </button>
            </nav>
            <button
              className="icon-btn tw:z-5 tw:hidden tw:text-[#f5f5ec] tw:below-760:flex tw:below-760:min-h-11"
              aria-label="منو"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </header>
          <div className="tw:absolute tw:top-[16%] tw:left-[6.5%] tw:text-public-note tw:leading-[2.4] tw:text-[#d6dcd4] tw:below-950:hidden">
            هر مسیر، یک تعهد است
            <br />
            حمل‌ونقل و لجستیک صنعتی
          </div>
          <div className="tw:relative tw:ms-[max(var(--public-gutter),calc((100%-1120px)/2))] tw:w-[min(40rem,calc(100%-2*var(--public-gutter)))] tw:self-center tw:py-[clamp(3rem,8vh,6rem)] tw:below-760:py-[clamp(2rem,8vh,4.5rem)]">
            <p className="eyebrow tw:mb-[1rem] tw:text-[#eceee5]">
              <i /> حمل بار، با خیال راحت
            </p>
            <h1 className="tw:max-w-full tw:text-[clamp(2.125rem,1.1rem+5vw,5.25rem)] tw:leading-[1.45] tw:font-bold tw:break-words">
              مسیر مطمئن،
              <br />
              <em className="tw:text-[#149fa4]">حمل هوشمند.</em>
            </h1>
            <p className="tw:mt-[1.25rem] tw:max-w-[35rem] tw:text-public-lead tw:leading-[2] tw:font-medium tw:text-[#dde4de]">
              از ثبت سفارش تا تحویل، در کنار شما. سریع، مطمئن و شفاف تا باری که
              به ما می‌سپارید بی‌دغدغه به مقصد برسد.
            </p>
            <div className="tw:mt-[1.5rem] tw:flex tw:flex-wrap tw:items-center tw:gap-x-[1.5rem] tw:gap-y-[0.5rem]">
              <button
                className="btn tw:min-h-11 tw:min-w-40 tw:gap-7 tw:px-5.5 tw:py-[13px] tw:below-760:min-w-[145px] tw:below-760:gap-5 tw:below-760:px-[17px] tw:below-760:py-2.5 tw:below-400:min-w-[135px] tw:below-400:gap-[15px]"
                onClick={() => setEntry(true)}
              >
                ورود به پنل‌ها
                <ArrowLeft size={18} />
              </button>
              <a
                href="#services"
                className="tw:flex tw:min-h-11 tw:items-center tw:gap-3.5 tw:text-public-label tw:below-760:gap-[5px]"
              >
                با خدمات ما آشنا شوید <ArrowUpLeft size={17} />
              </a>
            </div>
          </div>
          <div className="tw:absolute tw:bottom-[12%] tw:left-[8%] tw:flex tw:size-19 tw:flex-col tw:items-center tw:justify-center tw:rounded-[50%] tw:border tw:border-[#e8ede898] tw:text-public-note tw:leading-[1.3] tw:[transform:rotate(-12deg)] tw:outline-1 tw:outline-offset-12 tw:outline-[#e8ede86e] tw:below-950:hidden">
            مسیر
            <br />
            <b>مطمئن</b>
          </div>
          <div className="tw:relative tw:mx-(--public-gutter) tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-x-[1rem] tw:gap-y-2 tw:pb-[1.25rem] tw:text-public-note tw:text-[#c0cfca]">
            <span>الهام از ایران، ساخته برای آینده.</span>
            <a
              href="#manifesto"
              className="tw:flex tw:items-center tw:gap-2.5 tw:below-760:hidden"
            >
              ادامه مطلب <ArrowDown size={14} />
            </a>
            <span className="tw:below-560:hidden">۰۱ — ۰۵</span>
          </div>
        </section>
        <section
          className="section-wrap tw:pt-27.5 tw:pb-17.5 tw:below-950:py-[70px] tw:below-760:px-(--public-gutter) tw:below-760:py-15"
          id="manifesto"
        >
          <SectionKicker index="۰۱">دستی مطمئن در دنیایی پرتحرک</SectionKicker>
          <div className={editorialGrid}>
            <h2 className={sectionHeading}>
              لجستیک زنجیره‌ای
              <br />
              از <em>تصمیم‌های انسانی</em> است.
            </h2>
            <div>
              <p className={sectionText}>
                پشت هر پالت، قطعه و محموله، کسی منتظر رسیدنش است. ما از اولین
                گفت‌وگو تا تحویل نهایی، این را از یاد نمی‌بریم.
              </p>
              <p className={`muted tw:mt-3.5 ${sectionText}`}>
                الموت کنار کسب‌وکارها می‌ایستد تا جابه‌جایی کالا، رابطه‌ای باشد
                که بشود به آن تکیه کرد.
              </p>
              <a className="text-link tw:mt-6" href="#approach">
                کمی درباره روش کار ما <ArrowUpLeft size={18} />
              </a>
            </div>
          </div>
          <div className="tw:mt-[65px] tw:flex tw:flex-wrap tw:items-center tw:gap-[25px] tw:text-public-note tw:text-[#556b60] tw:below-760:mt-[35px] tw:below-760:gap-3">
            <span>کار در جزئیات است</span>
            <i className="tw:relative tw:h-px tw:flex-1 tw:bg-line tw:after:absolute tw:after:-top-3 tw:after:left-[45%] tw:after:text-[16px] tw:after:text-brand tw:after:content-['←']" />
            <span>و در کسانی که مراقب آن‌ها هستند</span>
          </div>
        </section>
        <section
          className="section-wrap tw:pt-12.5 tw:below-950:pt-[70px] tw:below-760:px-(--public-gutter) tw:below-760:pt-15"
          id="services"
        >
          <SectionKicker index="۰۲">خدمات ما</SectionKicker>
          <div className="tw:mb-[45px] tw:flex tw:items-center tw:justify-between tw:gap-20 tw:below-760:mb-7.5 tw:below-760:block">
            <h2 className={sectionHeading}>
              راه درست <em>رسیدن.</em>
            </h2>
            <p
              className={`${sectionText} tw:max-w-[420px] tw:text-[#526961] tw:below-760:mt-5 tw:below-760:max-w-full`}
            >
              هر کالا مسیر خودش را می‌خواهد. بگویید چه چیزی را جابه‌جا می‌کنید،
              به کجا می‌رود و چه چیزی برایتان مهم‌تر است.
            </p>
          </div>
          <div className="tw:grid tw:grid-cols-[repeat(3,1fr)] tw:border-t tw:border-r tw:border-[#dce4db] tw:below-950:grid-cols-[1fr_1fr] tw:below-560:grid-cols-1">
            {services.map((s, i) => (
              <article
                key={s.title}
                className="tw:flex tw:min-w-0 tw:flex-col tw:border-b tw:border-l tw:border-b-[#dce4db] tw:border-l-[#dce4db] tw:bg-[#fafbf63d] tw:p-8 tw:transition-[background] tw:duration-200 tw:hover:bg-white tw:below-760:p-[23px] tw:below-400:p-[25px]"
              >
                <div className="tw:mb-7.5 tw:flex tw:justify-between tw:text-brand tw:below-760:mb-[25px]">
                  <s.icon size={29} strokeWidth={1.3} />
                  <span className="tw:text-public-note tw:text-[#556b60]">
                    {number(i + 1).padStart(2, "۰")}
                  </span>
                </div>
                <h3 className="tw:mb-3 tw:text-public-card-title tw:leading-[1.65]">
                  {s.title}
                </h3>
                <p
                  className={`${sectionText} tw:min-h-0 tw:flex-1 tw:text-[#526961]`}
                >
                  {s.text}
                </p>
                <div className="tw:mt-5 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2.5 tw:below-760:gap-1.5">
                  <small className="tw:min-w-0 tw:flex-1 tw:text-public-note tw:leading-[1.7] tw:text-[#556b60]">
                    <i className="tw:ml-1.5 tw:inline-block tw:size-[5px] tw:rounded-[50%] tw:bg-gold" />
                    {s.note}
                  </small>
                  <a
                    href="#contact"
                    className="tw:grid tw:size-11 tw:flex-[0_0_44px] tw:place-items-center tw:rounded-[50%] tw:border tw:border-line"
                    aria-label={"اطلاعات بیشتر درباره " + s.title}
                  >
                    <ArrowUpLeft size={20} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          className="tw:relative tw:overflow-hidden tw:bg-[#173f3c] tw:text-[#f2f4e9]"
          id="approach"
        >
          <div className="section-wrap tw:grid tw:grid-cols-[1.1fr_1fr] tw:items-center tw:gap-30 tw:below-950:gap-15 tw:below-760:grid-cols-1 tw:below-760:gap-[25px] tw:below-760:px-(--public-gutter)">
            <div>
              <SectionKicker index="۰۳" light>
                روش الموت
              </SectionKicker>
              <h2 className={sectionHeading}>
                سفر خوب با
                <br />
                <em className="tw:text-[#a6c4ae]">یک گفت‌وگوی خوب</em>
                <br />
                شروع می‌شود.
              </h2>
              <p
                className={`${sectionText} tw:mt-5 tw:mb-7 tw:max-w-[430px] tw:text-[#aebfb2]`}
              >
                هیچ دو محموله‌ای شبیه هم نیستند. اول گوش می‌دهیم، بعد برنامه‌ای
                می‌چینیم که به بار، آدم‌ها و مقصد بخورد.
              </p>
              <a
                className="outline-btn tw:gap-10 tw:border-[#8da79969]"
                href="#contact"
              >
                شروع با یک گفت‌وگو
                <ArrowLeft size={18} />
              </a>
            </div>
            <div>
              {[
                [
                  "اول گوش می‌دهیم.",
                  "چه چیزی جابه‌جا می‌شود و چه چیزی برای شما مهم است؟",
                ],
                [
                  "برنامه روشن می‌چینیم.",
                  "مسیر، خودروی مناسب و تصویری مشترک از مراحل بعدی.",
                ],
                [
                  "تا آخر در جریان می‌مانیم.",
                  "از بارگیری و بازرسی تا تحویل و تأیید شما.",
                ],
              ].map(([t, p], i) => (
                <div
                  key={t}
                  className="tw:flex tw:gap-[25px] tw:border-b tw:border-b-[#ffffff20] tw:py-7 tw:below-760:py-5.5"
                >
                  <span className="tw:text-public-note tw:text-[#b9a879]">
                    {number(i + 1).padStart(2, "۰")}
                  </span>
                  <div>
                    <h3 className="tw:text-public-card-title tw:leading-[1.65]">
                      {t}
                    </h3>
                    <p
                      className={`${sectionText} tw:mt-2 tw:max-w-[430px] tw:text-[#aebfb2]`}
                    >
                      {p}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="section-wrap tw:below-760:px-(--public-gutter)"
          id="network"
        >
          <SectionKicker index="۰۴">فاصله میان مبدأ و مقصد</SectionKicker>
          <div className={editorialGrid}>
            <div>
              <h2 className={sectionHeading}>
                از نیشابور،
                <br />
                تا <em>سراسر ایران.</em>
              </h2>
              <p
                className={`${sectionText} tw:mt-4.5 tw:max-w-[420px] tw:text-[#526961]`}
              >
                هر جا که کسب‌وکار شما لازم دارد کالایش برسد، جزئیات شایسته
                توجه‌اند. مسیرها را با همراهی آدم‌ها، دقیق و مرحله‌به‌مرحله
                هماهنگ می‌کنیم.
              </p>
              <a className="text-link tw:mt-6" href="#contact">
                بگویید بار کجا باید برود
                <ArrowUpLeft size={18} />
              </a>
            </div>
            <div className="tw:relative tw:h-[370px] tw:overflow-hidden tw:rounded-[2px] tw:below-760:h-70">
              <img
                className="tw:size-full tw:object-cover tw:object-left"
                src="/alamut-road.jpg"
                alt="راه‌های کوهستانی ایران"
                loading="lazy"
              />
              <div className="tw:absolute tw:inset-x-0 tw:bottom-0 tw:flex tw:items-center tw:gap-3 tw:bg-[linear-gradient(0deg,#153633d9,transparent)] tw:px-[25px] tw:pt-10 tw:pb-5 tw:text-public-label tw:text-white">
                <MapPin size={18} /> هر مسیر، یک ارتباط تازه
              </div>
            </div>
          </div>
          <form
            className="tw:mt-17.5 tw:grid tw:min-w-0 tw:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] tw:items-center tw:gap-6 tw:border tw:border-[#e0e6da] tw:bg-[#eef2e9] tw:p-7.5 tw:[&>*]:min-w-0 tw:below-950:grid-cols-[minmax(0,1fr)_auto] tw:below-760:mt-10 tw:below-760:grid-cols-1 tw:below-760:gap-4 tw:below-760:px-4.5 tw:below-760:py-5.5"
            onSubmit={track}
          >
            <div className="tw:below-950:col-span-full tw:below-760:col-auto">
              <span className="eyebrow tw:text-[#556b60]">از مبدأ تا مقصد</span>
              <h3 className="tw:mt-[5px] tw:text-public-card-title tw:leading-[1.65]">
                بارتان در کدام مرحله است؟
              </h3>
            </div>
            <label>
              <span className="tw:sr-only">کد پیگیری</span>
              <input
                name="code"
                placeholder="AL-XXXXXXXXXX"
                required
                dir="ltr"
                maxLength={20}
              />
            </label>
            <button className="btn tw:below-760:w-full" type="submit">
              <Search size={18} /> پیگیری محموله
            </button>
            {trackError && (
              <p className="error full" role="alert">
                {trackError}
              </p>
            )}
            {tracking && (
              <div className="full tw:flex tw:min-w-0 tw:flex-wrap tw:items-center tw:gap-7.5 tw:border-t tw:border-line tw:pt-5 tw:below-760:gap-3">
                <b dir="ltr">{tracking.code}</b>
                <span>
                  {tracking.origin} ← {tracking.destination}
                </span>
                <Badge status={tracking.status} />
              </div>
            )}
          </form>
        </section>
        <section
          className="tw:border-t tw:border-[#dfdfd3] tw:bg-[#edece1]"
          id="contact"
        >
          <div className="section-wrap tw:pb-22.5 tw:below-760:px-(--public-gutter) tw:below-760:pb-15">
            <SectionKicker index="۰۵">بیایید وارد جزئیات شویم</SectionKicker>
            <div className={editorialGrid}>
              <div>
                <h2 className={sectionHeading}>
                  چه چیزی
                  <br />
                  باید <em>جابه‌جا شود؟</em>
                </h2>
                <p
                  className={`${sectionText} tw:mt-5 tw:max-w-[380px] tw:text-[#66725f]`}
                >
                  کمی درباره محموله بگویید. درخواست شما در مرکز عملیات ثبت
                  می‌شود تا مراحل بعدی هماهنگ شود.
                </p>
                <div className="tw:mt-[45px] tw:flex tw:items-center tw:gap-4 tw:text-public-label tw:text-brand tw:below-760:mt-[25px]">
                  <ShieldCheck size={30} strokeWidth={1.2} />
                  <span>
                    آدم‌های واقعی. گفت‌وگوی واقعی.
                    <small className="tw:mt-[3px] tw:block tw:text-public-note tw:text-[#66725f]">
                      از هر جا که هستید شروع کنید.
                    </small>
                  </span>
                </div>
              </div>
              {sent ? (
                <div
                  className="tw:flex tw:min-h-[16rem] tw:flex-col tw:items-center tw:justify-center tw:px-2 tw:py-8 tw:text-center tw:text-brand"
                  role="status"
                >
                  <CheckCircle2 size={50} />
                  <h3 className="tw:mt-4.5 tw:text-public-card-title tw:leading-[1.65]">
                    شروع یک مسیر تازه
                  </h3>
                  <p
                    className={`${sectionText} tw:mx-auto tw:mt-3 tw:mb-[25px] tw:max-w-[380px] tw:text-[#66725f]`}
                  >
                    {sent}
                  </p>
                  <button className="text-link" onClick={() => setSent("")}>
                    ثبت درخواست دیگر
                  </button>
                </div>
              ) : (
                <form
                  className="tw:pt-2 tw:[&>label+label]:mt-5 tw:[&_input]:border-[#d5dacd] tw:[&_input]:bg-[#f8f8f0a6] tw:[&_textarea]:border-[#d5dacd] tw:[&_textarea]:bg-[#f8f8f0a6]"
                  onSubmit={contact}
                >
                  <label>
                    نام و نام خانوادگی
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
                      placeholder="نام شما"
                    />
                  </label>
                  <label>
                    شماره موبایل
                    <input
                      name="phone"
                      required
                      pattern="[0۰٠][9۹٩][0-9۰-۹٠-٩]{9}"
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="09123456789"
                    />
                  </label>
                  <label>
                    چه باری را می‌خواهید حمل کنید؟
                    <textarea
                      name="message"
                      required
                      maxLength={2000}
                      rows={4}
                      placeholder="نوع بار، مبدأ، مقصد و زمان مورد نظر…"
                    />
                  </label>
                  {error && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="btn tw:mt-[25px] tw:w-full tw:justify-between"
                    disabled={busy}
                  >
                    ارسال درخواست
                    <ArrowLeft size={18} />
                  </button>
                  <small className="tw:mt-3 tw:block tw:text-center tw:text-public-note tw:text-[#66725f]">
                    بدون تعهد. فقط شروعی خوب.
                  </small>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
      <PublicMobileNav />
      {entry && (
        <Modal title="کدام پنل را می‌خواهید؟" onClose={() => setEntry(false)}>
          <p className="muted">
            نقش خود را انتخاب کنید و وارد فضای کارتان شوید.
          </p>
          <div className="tw:my-6 tw:flex tw:flex-col tw:gap-2.5">
            {(Object.keys(roles) as Role[]).map((r) => (
              <Link
                key={r}
                href={appHref("/login?role=" + r)}
                className="tw:flex tw:items-center tw:justify-between tw:rounded-[8px] tw:border tw:border-line tw:px-5 tw:py-[17px] tw:hover:border-[#a1beb0] tw:hover:bg-[#eff6f1]"
              >
                <span>
                  {roles[r]}
                  <small className="tw:mt-[3px] tw:block tw:text-[11px] tw:text-muted">
                    {
                      {
                        owner: "ثبت، مدیریت و پیگیری محموله‌ها",
                        driver: "اعلام آمادگی، پیشنهاد و مدیریت سفر",
                        operator: "هماهنگی ناوگان و مرکز عملیات",
                        inspector: "بازرسی، پلمب و تأیید سلامت بار",
                      }[r]
                    }
                  </small>
                </span>
                <ArrowUpLeft size={22} />
              </Link>
            ))}
          </div>
          <p className="muted small">
            حساب ندارید؟{" "}
            <Link href={appHref("/register")}>ثبت‌نام صاحب بار و راننده</Link>
          </p>
        </Modal>
      )}
    </div>
  );
}
