"use client";
import { number, type Role, type Shipment, type User } from "@/lib/api";
import type { Dash } from "@/lib/workspace-types";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Package,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "@/lib/navigation";
import type { ReactNode } from "react";
import type { WorkspaceLink } from "../mobile-navigation";
const actionDescription: Record<string, string> = {
  new: "مشخصات بار و مسیر را ثبت کنید.",
  market: "بارهای آماده را بررسی کنید و پیشنهاد بدهید.",
  onboarding: "اطلاعات و مدارک را برای بررسی اپراتور تکمیل کنید.",
  control: "موقعیت ناوگان و موارد نیازمند پیگیری را ببینید.",
  inspections: "مأموریت‌های بازرسی و چک‌لیست‌ها را باز کنید.",
};
export default function Overview({
  dash,
  user,
  role,
  base,
  shipmentTable,
  mobileAction,
}: {
  dash: Dash;
  user: User | null;
  role: Role;
  base: string;
  shipmentTable: (rows: Shipment[]) => ReactNode;
  mobileAction?: WorkspaceLink;
}) {
  const canDispatch =
    role !== "operator" || Boolean(user?.capabilities.includes("dispatch"));
  const driverAction = user?.driver_market_enabled
    ? {
        href: "/market",
        label: "مشاهده بازار بار",
        detail: actionDescription.market,
      }
    : {
        href: "/onboarding",
        label: "تکمیل پرونده راننده",
        detail: actionDescription.onboarding,
      };
  const nextSection = canDispatch
    ? "shipments"
    : user?.capabilities.includes("crm")
      ? "crm"
      : user?.capabilities.includes("monitoring")
        ? "control"
        : user?.capabilities.includes("verification")
          ? "team"
          : user?.capabilities.includes("finance")
            ? "invoices"
            : user?.capabilities.includes("content")
              ? "articles"
              : "settings";
  return (
    <>
      <div className="welcome tw:flex tw:justify-between tw:items-center tw:mb-[29px] tw:below-760:[align-items:start] tw:below-760:gap-2.5 tw:below-760:mb-[23px]">
        <div>
          <span className="eyebrow">هر مسیر، یک تعهد است</span>
          <h1>
            {user?.first_name} عزیز، روزتان بخیر
            <span className="tw:text-brand">.</span>
          </h1>
          <p>اینجا، تصویر روشنی از مسیرهای پیش روی شماست.</p>
        </div>
        <div className="today tw:border tw:border-line tw:py-[9px] tw:px-4 tw:rounded-[8px] tw:text-left tw:min-w-45 tw:bg-[#fcfcf6] tw:below-950:min-w-37.5 tw:below-950:py-2 tw:below-950:px-3 tw:below-760:min-w-[95px] tw:below-760:py-[7px] tw:below-760:px-[9px] tw:below-760:text-center tw:below-400:min-w-[85px] tw:below-760:hidden">
          <span>امروز</span>
          <b>
            {new Date().toLocaleDateString("fa-IR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </b>
          <small>
            مرکز هماهنگی الموت <i />
          </small>
        </div>
      </div>
      {role === "owner" && user && !/^\d{10}$/.test(user.postal_code || "") && (
        <p className="info-note">
          برای ثبت بار، کد پستی ۱۰ رقمی را در{" "}
          <Link href={base + "/settings"}>حساب کاربری</Link> ذخیره کنید.
        </p>
      )}
      {role === "owner" &&
        user &&
        user.kyc_status &&
        user.kyc_status !== "approved" &&
        user.kyc_status !== "missing" && (
          <p className="info-note">
            احراز هویت شما {user.kyc_status === "rejected" ? "رد شده" : "در انتظار بررسی"} است.
            تا تأیید اپراتور، ثبت بار بسته می‌ماند.
          </p>
        )}
      {mobileAction && (
        <Link className="app-dashboard-action" href={mobileAction.href}>
          <span className="app-action-icon">
            <mobileAction.icon size={24} strokeWidth={1.7} />
          </span>
          <span>
            <strong>{mobileAction.label}</strong>
            <small>
              {actionDescription[mobileAction.key] ||
                "ورود مستقیم به بخش کاری شما"}
            </small>
          </span>
          <ArrowLeft size={20} />
        </Link>
      )}
      <div className="stats-grid tw:grid-cols-4 tw:gap-[17px] tw:mb-[25px] tw:wide:gap-6 tw:below-950:grid-cols-[1fr_1fr] tw:below-760:gap-3 tw:below-760:mb-4.5 tw:grid">
        {[
          {
            t: "کل محموله‌ها",
            v: dash.total,
            i: Package,
            s: "از شروع همکاری",
          },
          {
            t: "حمل‌های فعال",
            v: dash.active,
            i: Truck,
            s: "در چرخه عملیات",
            active: true,
          },
          {
            t: "تحویل‌های موفق",
            v: dash.delivered,
            i: CheckCircle2,
            s: "رسیده به مقصد",
          },
          {
            t: role === "inspector" ? "نیازمند پیگیری" : "مانده صورتحساب",
            v: role === "inspector" ? dash.open_tickets : dash.unpaid,
            i: role === "inspector" ? MessageSquare : Wallet,
            s: role === "inspector" ? "تیکت باز" : "تومان",
          },
        ].map((x) => (
          <article
            className={"stat-card tw:border tw:border-[#e3e8dc] tw:rounded-[11px] tw:pt-[21px] tw:px-[23px] tw:pb-4.5 tw:bg-[#fffefa] tw:relative tw:overflow-hidden tw:min-h-36.5 tw:wide:py-6 tw:wide:px-7 tw:wide:min-h-40 tw:below-1200:py-4.5 tw:below-1200:px-[17px] tw:below-760:py-4 tw:below-760:px-4.5 tw:below-760:min-h-[133px] tw:below-760:rounded-[9px] tw:below-400:p-3.5 " + (x.active ? "featured" : "")}
            key={x.t}
          >
            <div>
              <span>{x.t}</span>
              <x.i size={21} strokeWidth={1.5} />
            </div>
            <strong>{number(x.v)}</strong>
            <small>{x.s}</small>
          </article>
        ))}
      </div>
      <div className="tw:grid-cols-[1.8fr_1fr] tw:gap-5.5 tw:mb-[25px] tw:wide:gap-6.5 tw:wide:grid-cols-[1.9fr_1fr] tw:below-1200:grid-cols-[1.5fr_1fr] tw:below-1200:gap-[17px] tw:below-950:grid-cols-[1fr] tw:below-760:mb-4.5 tw:grid">
        <section className="card route-card">
          <div className="card-head">
            <div>
              <h2>مسیرها در جریان‌اند</h2>
              <p>وضعیت عملیاتی محموله‌های شما</p>
            </div>
            <span className="live-label tw:text-[9px] tw:flex tw:items-center tw:gap-1.5 tw:text-[#8b9c82] tw:bg-[#f5f7ee] tw:py-[3px] tw:px-[7px] tw:rounded-[4px] tw:whitespace-nowrap tw:below-760:text-[8px]">
              <i /> ثبت مرحله‌ای
            </span>
          </div>
          <div className="route-visual tw:mt-[15px] tw:mx-5.5 tw:mb-0 tw:below-760:mt-2.5 tw:below-760:mx-2.5 tw:below-760:mb-0 tw:relative">
            <svg
              viewBox="0 0 700 220"
              role="img"
              aria-label="نمای شماتیک مراحل حمل"
            >
              <defs>
                <pattern
                  id="grid"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="#dbe5e0"
                    strokeWidth=".65"
                  />
                </pattern>
              </defs>
              <rect width="700" height="220" fill="url(#grid)" />
              <path
                d="M60 145C150 140 130 55 235 75S350 185 440 120 530 65 635 80"
                fill="none"
                stroke="#d6e3de"
                strokeWidth="22"
              />
              <path
                d="M60 145C150 140 130 55 235 75S350 185 440 120 530 65 635 80"
                fill="none"
                stroke="#087f8c"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              {[
                [60, 145],
                [235, 75],
                [440, 120],
                [635, 80],
              ].map(([cx, cy], i) => (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="#f8faf7"
                    stroke="#087f8c"
                    strokeWidth="2"
                  />
                  <circle cx={cx} cy={cy} r="4" fill="#087f8c" />
                </g>
              ))}
            </svg>
            <div className="route-labels tw:mt-[-11px] tw:pt-0 tw:px-2.5 tw:pb-[15px] tw:[direction:rtl] tw:below-760:pt-0 tw:below-760:px-2.5 tw:below-760:pb-[15px] tw:below-760:mt-[-5px] tw:text-[#64745e] tw:text-[12px] tw:below-760:text-[10px] tw:flex tw:justify-between">
              <span>ثبت درخواست</span>
              <span>تخصیص و بارگیری</span>
              <span>در مسیر</span>
              <span>تحویل نهایی</span>
            </div>
          </div>
          <div className="route-summary tw:flex tw:items-center tw:gap-5 tw:my-0 tw:mx-[25px] tw:py-4 tw:px-0 tw:border-t tw:border-t-line tw:below-1200:gap-3 tw:below-760:py-3.5 tw:below-760:px-0 tw:below-760:my-0 tw:below-760:mx-[17px] tw:below-760:gap-3.5 tw:text-[#64745e] tw:text-[12px] tw:below-760:text-[10px]">
            <span>
              <i className="tw:inline-block tw:w-1.5 tw:h-1.5 tw:rounded-full tw:bg-brand tw:shrink-0" />
              {number(dash.active)} محموله فعال
            </span>
            <span>
              <i className="tw:inline-block tw:w-1.5 tw:h-1.5 tw:rounded-full tw:shrink-0 tw:bg-gold" />
              {number(dash.pending)} منتظر بررسی
            </span>
            <Link href={base + "/" + nextSection}>
              مشاهده مسیرها
              <ArrowLeft size={14} />
            </Link>
          </div>
        </section>
        <section className="card attention-card tw:bg-[#ecefe3] tw:py-[27px] tw:px-7 tw:relative tw:border-[#e0e6d7] tw:wide:p-8 tw:below-1200:p-[23px] tw:below-950:hidden">
          <span className="eyebrow">قدم بعدی شما</span>
          <h2>
            جزئیات کوچک،
            <br />
            <em>مسیرهای بهتر.</em>
          </h2>
          <p>
            {role === "owner"
              ? "درخواست حمل را با مشخصات دقیق ثبت کنید؛ هماهنگی مسیر از همین‌جا شروع می‌شود."
              : role === "driver"
                ? driverAction.detail
                : role === "inspector"
                  ? "محموله‌های تخصیص‌یافته و چک‌لیست‌های بازرسی در انتظار شما هستند."
                  : "درخواست‌های تازه را بررسی و مناسب‌ترین راننده و متصدی را هماهنگ کنید."}
          </p>
          <Link
            className="btn"
            href={
              base +
              (role === "owner"
                ? "/shipments/new"
                : role === "driver"
                  ? driverAction.href
                  : "/" + nextSection)
            }
          >
            {role === "owner"
              ? "ثبت درخواست حمل"
              : role === "driver"
                ? driverAction.label
                : canDispatch
                  ? "بررسی محموله‌ها"
                  : "ورود به بخش کاری"}
            <ArrowLeft size={17} />
          </Link>
          <MountainMark />
        </section>
      </div>
      {canDispatch && (
        <section className="card">
          <div className="card-head">
            <div>
              <h2>آخرین محموله‌ها</h2>
              <p>جزئیات هر سفر، همیشه در دسترس</p>
            </div>
            <Link className="text-link" href={base + "/" + nextSection}>
              همه محموله‌ها
              <ArrowLeft size={15} />
            </Link>
          </div>
          {shipmentTable(dash.recent)}
        </section>
      )}
    </>
  );
}

function MountainMark() {
  return (
    <svg className="tw:absolute tw:-bottom-1.5 tw:-left-5 tw:text-[#c3cdb2] tw:w-37.5 tw:h-25 tw:opacity-80" viewBox="0 0 160 90" aria-hidden="true">
      <path
        d="M5 85 55 10l48 75H5Zm58 0 42-60 47 60H63Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
