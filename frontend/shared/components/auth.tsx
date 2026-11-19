"use client";
import { api, panelPaths, roles, type Role, type User } from "@/lib/api";
import { siteHref } from "@/lib/deployment-links";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "@/lib/navigation";
import { useRouter, useSearchParams } from "@/lib/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Brand } from "./ui";
const demoNote =
  "tw:bg-[#eff4e9] tw:border tw:border-dashed tw:border-[#cbd7bd] tw:rounded-[9px] tw:py-[13px] tw:px-[17px] tw:mt-5.5 tw:text-[#6e7d60] tw:text-[12px]";
const demoValue = "tw:inline-block tw:text-[#365547]";

export default function Auth({
  register = false,
  fixedRole,
  onSignedIn,
}: {
  register?: boolean;
  fixedRole?: Role;
  onSignedIn?: (user: User) => void;
}) {
  const params = useSearchParams(),
    router = useRouter();
  const initial = fixedRole || (params.get("role") as Role);
  const [role, setRole] = useState<Role>(
      Object.keys(roles).includes(initial) &&
        (!register || ["owner", "driver"].includes(initial))
        ? initial
        : "owner",
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [demo, setDemo] = useState(false),
    [sms, setSms] = useState(false),
    [phone, setPhone] = useState(""),
    [otp, setOtp] = useState(""),
    [demoCode, setDemoCode] = useState("");
  const driverRegistration = register && role === "driver";
  useEffect(() => {
    api<{ demo_enabled: boolean }>("auth/csrf/")
      .then((r) => setDemo(r.demo_enabled))
      .catch(() => {});
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      if (
        driverRegistration &&
        values.password !== values.password_confirmation
      ) {
        setError("رمز عبور و تکرار آن باید یکسان باشند.");
        return;
      }
      delete values.password_confirmation;
      const user = await api<User>(
        "auth/" + (register ? "register/" : "login/"),
        "POST",
        { ...values, role },
      );
      if (onSignedIn) {
        onSignedIn(user);
        return;
      }
    router.push(
        "/" +
          panelPaths[user.role] +
          (user.role === "driver" && !user.driver_market_enabled
            ? "/onboarding"
            : ""),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      id="main"
      className={
        "auth-layout tw:min-h-[100svh] tw:grid tw:grid-cols-[1.1fr_1fr] tw:bg-[#fafbf7] tw:below-950:grid-cols-[1fr_0.7fr] tw:below-760:block" + (fixedRole || driverRegistration ? " role-auth" : "")
      }
      data-role={role}
    >
      <div className="auth-form-side tw:py-8 tw:px-[7%] tw:below-950:py-7 tw:below-950:px-[6%] tw:below-760:py-[25px] tw:below-760:px-6 tw:below-760:min-h-[100svh] tw:flex tw:flex-col">
        <div className="tw:flex tw:justify-between tw:items-center tw:below-760:[&>.brand]:min-w-[130px]">
          <Brand />
          <Link href={siteHref("/")} className="text-link tw:text-[11px] tw:below-760:text-[10px]">
            صفحه اصلی <ArrowLeft size={17} />
          </Link>
        </div>
        <div className="auth-box tw:max-w-[420px] tw:w-full tw:mt-[65px] tw:mx-auto tw:mb-12.5 tw:below-950:mt-[45px] tw:below-760:my-[45px] tw:below-760:mx-auto">
          <span className="eyebrow tw:mb-3 tw:text-brand">فضای کار یکپارچه الموت</span>
          <h1 className="tw:text-[36px] tw:below-760:text-[31px]">
            {register
              ? role === "driver"
                ? "ثبت‌نام راننده"
                : "شروع یک همکاری تازه"
              : fixedRole
                ? "ورود به برنامهٔ " + roles[fixedRole]
                : "خوش آمدید."}
          </h1>
          <p className="muted tw:mt-2 tw:text-[14px]">
            {register
              ? role === "driver"
                ? "حساب را بسازید و پروندهٔ همکاری را تکمیل کنید. پس از بررسی اپراتور، بازار بار باز می‌شود."
                : "حساب خود را بسازید و اولین مسیر را شروع کنید."
              : fixedRole
                ? "برای ادامه، مشخصات حساب خود را وارد کنید."
                : "برای ادامه، نقش و مشخصات حساب خود را وارد کنید."}
          </p>
          {!fixedRole && (
            <div className="tw:flex tw:gap-1 tw:p-[5px] tw:bg-[#edf0e9] tw:border tw:border-[#e4e9df] tw:rounded-[9px] tw:my-[27px] tw:mx-0" role="group" aria-label="انتخاب نقش">
              {(Object.keys(roles) as Role[])
                .filter((r) => !register || ["owner", "driver"].includes(r))
                .map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="tw:flex-1 tw:rounded-[6px] tw:bg-transparent tw:px-1.5 tw:py-[9px] tw:text-[13px] tw:text-[#7a8879] tw:aria-pressed:bg-white tw:aria-pressed:font-semibold tw:aria-pressed:text-brand tw:aria-pressed:[box-shadow:0_2px_5px_#163d2110]"
                    aria-pressed={role === r}
                    onClick={() => setRole(r)}
                  >
                    {roles[r]}
                  </button>
                ))}
            </div>
          )}
          {sms && role === "owner" && !register ? (
            <form
              className="tw:[&>label]:mb-[19px]"
              onSubmit={(event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                void (demoCode
                  ? api<User>("auth/otp/confirm/", "POST", { phone, code: otp })
                  : api<{ detail: string; demo_code?: string }>(
                      "auth/otp/",
                      "POST",
                      { phone },
                    )
                )
                  .then((result) => {
                    if ("username" in result) {
                      if (onSignedIn) onSignedIn(result);
                      else router.push("/" + panelPaths[result.role]);
                      return;
                    }
                    setDemoCode(result.demo_code || "");
                    setError(result.demo_code ? "" : result.detail);
                  })
                  .catch((reason) => setError((reason as Error).message))
                  .finally(() => setBusy(false));
              }}
            >
              <label>
                موبایل صاحب بار
                <input
                  value={phone}
                  dir="ltr"
                  required
                  inputMode="tel"
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              {demoCode && (
                <>
                  <p className={demoNote}>
                    کد آزمایشی: <code className={demoValue} dir="ltr">{demoCode}</code>
                  </p>
                  <label>
                    کد تأیید
                    <input
                      value={otp}
                      dir="ltr"
                      required
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(event) => setOtp(event.target.value)}
                    />
                  </label>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn block tw:mt-[25px]" disabled={busy}>
                {demoCode ? "تأیید و ورود" : "دریافت کد"}
              </button>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setSms(false);
                  setError("");
                }}
              >
                ورود با نام کاربری
              </button>
            </form>
          ) : (
          <form className="tw:[&>label]:mb-[19px]" onSubmit={submit}>
            {register && (
              <div className="form-grid tw:mb-5">
                <label>
                  نام
                  <input
                    name="first_name"
                    required
                    maxLength={150}
                    autoComplete="given-name"
                  />
                </label>
                <label>
                  نام خانوادگی
                  <input
                    name="last_name"
                    required
                    maxLength={150}
                    autoComplete="family-name"
                  />
                </label>
                <label className="full">
                  شماره موبایل
                  <input
                    name="phone"
                    required
                    pattern="[0۰٠][9۹٩][0-9۰-۹٠-٩]{9}"
                    dir="ltr"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="09123456789"
                  />
                </label>
                {role === "driver" && (
                  <label className="full">
                    ایمیل بازیابی رمز (اختیاری)
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      dir="ltr"
                    />
                  </label>
                )}
                {role === "owner" && (
                  <label className="full">
                    نام شرکت (اختیاری)
                    <input name="company" maxLength={120} />
                  </label>
                )}
              </div>
            )}
            <label>
              نام کاربری
              <input
                key={"username" + role}
                name="username"
                dir="ltr"
                required
                autoComplete="username"
                placeholder={demo ? role + ".demo" : "نام کاربری"}
                maxLength={150}
              />
            </label>
            <label>
              رمز عبور
              <div className="tw:relative tw:mt-[7px]">
                <input
                  name="password"
                  className="tw:pr-[45px]"
                  type={show ? "text" : "password"}
                  required
                  minLength={register ? 8 : 1}
                  dir="ltr"
                  autoComplete={register ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="icon-btn tw:absolute tw:top-[5px] tw:right-1 tw:text-[#8a9889]"
                  aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {driverRegistration && (
              <label>
                تکرار رمز عبور
                <input
                  name="password_confirmation"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  dir="ltr"
                  autoComplete="new-password"
                />
              </label>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {!register && (
              <>
                <label>
                  کد دومرحله‌ای (اگر فعال کرده‌اید)
                  <input
                    name="code"
                    inputMode="numeric"
                    maxLength={6}
                    dir="ltr"
                    autoComplete="one-time-code"
                    pattern="[0-9۰-۹٠-٩]{6}"
                  />
                </label>
                <Link className="text-link small" href="/recover">
                  رمز عبور را فراموش کرده‌اید؟
                </Link>
              </>
            )}
            <button className="btn block tw:mt-[25px]" disabled={busy}>
              {busy
                ? "لطفاً صبر کنید…"
                : register
                  ? role === "driver"
                    ? "ساخت حساب و تکمیل پرونده"
                    : "ایجاد حساب کاربری"
                  : "ورود به پنل " + roles[role]}
              <ArrowLeft size={18} />
            </button>
          </form>
          )}
          {role === "owner" && !register && !sms && (
            <button
              type="button"
              className="secondary-btn block tw:mt-[25px]"
              onClick={() => {
                if (!demo) {
                  setError(
                    "ورود پیامکی در این محیط فعال نیست. با نام کاربری و رمز وارد شوید.",
                  );
                  return;
                }
                setSms(true);
                setError("");
              }}
            >
              ورود با پیامک
            </button>
          )}
          {demo && !register && !sms && (
            <div className={demoNote}>
              <b>محیط آزمایشی با داده‌های نمونه</b>
              <p className="tw:mt-1 tw:leading-[2.2]">
                نام کاربری: <code className={demoValue} dir="ltr">{role}.demo</code>
                <br />
                رمز عبور: <code className={demoValue} dir="ltr">AlamutDemo!2026</code>
              </p>
            </div>
          )}
          {(!fixedRole || ["owner", "driver"].includes(fixedRole)) && (
            <p className="tw:mt-[25px] tw:mb-[15px] tw:text-center tw:text-[14px]">
              {register ? "قبلاً ثبت‌نام کرده‌اید؟" : "حساب کاربری ندارید؟"}{" "}
              <Link
                className="tw:font-semibold tw:text-brand"
                href={(register ? "/login" : "/register") + "?role=" + role}
              >
                {register ? "ورود به سامانه" : "ثبت‌نام رایگان"}
              </Link>
            </p>
          )}
          <small className="muted tw:block tw:text-center tw:text-[12px] tw:leading-[2]">
            ثبت‌نام به معنی شروع همکاری است. احراز مدارک راننده توسط اپراتور
            انجام می‌شود. <Link href={siteHref("/privacy")}>حریم خصوصی</Link>
          </small>
        </div>
        <small className="tw:text-center tw:text-[#8d998a] tw:text-[10px] tw:mt-auto tw:below-760:mt-5">الموت · هر مسیر، یک تعهد است.</small>
      </div>
      <aside className="tw:relative tw:overflow-hidden tw:min-h-full tw:below-760:hidden">
        <img className="tw:absolute tw:size-full tw:object-cover tw:object-[65%_center]" src="/alamut-road.jpg" alt="جاده‌ای میان کوهستان" />
        <div className="tw:absolute tw:inset-0 tw:bg-[linear-gradient(0deg,#103e3be8,#173d3c30)]" />
        <div className="tw:relative tw:flex tw:h-full tw:min-h-[700px] tw:flex-col tw:justify-end tw:px-[12%] tw:py-[10%] tw:text-white tw:below-950:p-[12%]">
          <ShieldCheck size={42} strokeWidth={1} />
          <h2 className="tw:mt-[25px] tw:text-[44px] tw:leading-[1.7] tw:below-950:text-[32px]">
            مسیر مطمئن،
            <br />
            <em className="tw:text-[#8dc0ac]">همکاری ماندگار.</em>
          </h2>
          <p className="tw:mt-5.5 tw:text-[13px] tw:text-[#d1dfce]">
            از اولین کیلومتر تا تحویل نهایی،
            <br />
            همه جزئیات در کنار شماست.
          </p>
        </div>
      </aside>
    </main>
  );
}
