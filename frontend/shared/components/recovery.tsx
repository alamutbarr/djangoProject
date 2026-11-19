"use client";
import { useSearchParams } from "@/lib/navigation";
import Link from "@/lib/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Brand } from "./ui";
import { ActionForm } from "./forms";
export default function Recovery() {
  const params = useSearchParams(),
    [message, setMessage] = useState("");
  const uid = params.get("uid"),
    token = params.get("token");
  return (
    <main id="main" className="section-wrap tw:max-w-[620px] tw:min-h-[100svh]">
      <Brand />
      <section className="card form-card tw:mt-[45px]">
        <h1 className="tw:mb-[15px] tw:text-[28px]">{uid && token ? "انتخاب رمز جدید" : "بازیابی حساب"}</h1>
        <p className="muted">
          ایمیل ثبت‌شده در حساب لازم است. ارسال ایمیل در محیط عمومی به تنظیمات
          سرویس ایمیل نیاز دارد.
        </p>
        {!message ? (
          <ActionForm
            fields={
              uid && token
                ? [
                    {
                      name: "new_password",
                      label: "رمز جدید",
                      type: "password",
                      required: true,
                      full: true,
                    },
                  ]
                : [
                    {
                      name: "email",
                      label: "ایمیل حساب",
                      type: "email",
                      required: true,
                      full: true,
                    },
                  ]
            }
            submit={uid && token ? "ذخیره رمز جدید" : "درخواست راهنمای بازیابی"}
            onSubmit={async (d) => {
              const res = await api<{ detail: string }>(
                uid && token ? "auth/recovery/confirm/" : "auth/recovery/",
                "POST",
                { ...d, ...(uid && token ? { uid, token } : {}) },
              );
              setMessage(res.detail);
            }}
          />
        ) : (
          <p className="info-note" role="status">
            {message}
          </p>
        )}
        <Link className="text-link tw:mt-6" href="/login">
          بازگشت به ورود
        </Link>
      </section>
    </main>
  );
}
