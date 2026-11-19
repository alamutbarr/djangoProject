"use client";
import { number, statuses } from "@/lib/api";
import type { Dash } from "@/lib/workspace-types";
import { Download } from "lucide-react";
import { Empty } from "../ui";
import { PageTitle } from "./shared";
export default function Reports({
  dash,
  canExport = true,
}: {
  dash: Dash;
  canExport?: boolean;
}) {
  return (
    <>
      <PageTitle
        title="تصویر روشن عملکرد"
        text="گزارش از داده‌های واقعی قابل مشاهده برای نقش شما"
      />
      <div className="tw:grid tw:grid-cols-[1fr_1fr] tw:gap-6 tw:[align-items:start] tw:below-950:grid-cols-[1fr] tw:below-760:gap-4.5">
        <section className="card report-card tw:p-[27px] tw:below-760:p-[23px]">
          <h2>توزیع وضعیت محموله‌ها</h2>
          {dash.by_status.length ? (
            dash.by_status.map((s) => (
              <div className="bar-row tw:my-5.5 tw:mx-0" key={s.status}>
                <div>
                  <span>{statuses[s.status]}</span>
                  <b>{number(s.count)}</b>
                </div>
                <div className="bar-track tw:h-[7px] tw:bg-[#edf1e5] tw:rounded-[4px] tw:overflow-hidden">
                  <i
                    style={{
                      width: (s.count / Math.max(dash.total, 1)) * 100 + "%",
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <Empty />
          )}
        </section>
        <section className="card report-card tw:p-[27px] tw:below-760:p-[23px]">
          <h2>شاخص‌های عملیات</h2>
          <div className="report-metric tw:py-5.5 tw:px-0 tw:flex tw:items-center tw:justify-between tw:border-b tw:border-b-line tw:text-[11px]">
            <span>نرخ تحویل از کل درخواست‌ها</span>
            <strong>
              {number(
                dash.total
                  ? Math.round((dash.delivered / dash.total) * 100)
                  : 0,
              )}
              ٪
            </strong>
          </div>
          <div className="report-metric tw:py-5.5 tw:px-0 tw:flex tw:items-center tw:justify-between tw:border-b tw:border-b-line tw:text-[11px]">
            <span>محموله‌های در جریان</span>
            <strong>{number(dash.active)}</strong>
          </div>
          <div className="report-metric tw:py-5.5 tw:px-0 tw:flex tw:items-center tw:justify-between tw:border-b tw:border-b-line tw:text-[11px]">
            <span>درخواست‌های پشتیبانی باز</span>
            <strong>{number(dash.open_tickets)}</strong>
          </div>
          {canExport && (
            <a href="/api/shipments/export/" className="secondary-btn">
              <Download size={17} />
              دریافت داده‌های محموله‌ها
            </a>
          )}
        </section>
      </div>
    </>
  );
}
