"use client";
import {
  api,
  ApiError,
  date,
  money,
  number,
  panelPaths,
  roles,
  statuses,
  vehicles,
  type Page,
  type Role,
  type Shipment,
  type User,
} from "@/lib/api";
import type {
  Dash,
  Invoice,
  Notice,
  Ops,
  Ticket,
  Vehicle,
} from "@/lib/workspace-types";
import {
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  LayoutDashboard,
  LogOut,
  Mountain,
  MessageSquare,
  Package,
  Plus,
  Moon,
  PanelRight,
  RefreshCw,
  Route,
  Sun,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "@/lib/navigation";
import { useRouter } from "@/lib/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { ActionForm, ShipmentForm } from "./forms";
import { NationalIdGate, OwnerKycReview } from "./owner-identity";
import OwnerShipmentWizard from "./owner-shipment-wizard";
import { nationalIdOk } from "@/lib/national-id";
import Overview from "./panels/dashboard";
import Finance from "./panels/invoices";
import Notifications from "./panels/notifications";
import Operations from "./panels/operations";
import Reports from "./panels/reports";
import Account from "./panels/settings";
import ShipmentDetail from "./panels/shipment-detail";
import Team from "./panels/team";
import Support from "./panels/tickets";
import Complaints from "./panels/complaints";
import { Badge, Brand, Empty, Loading, Modal } from "./ui";
import Onboarding from "./panels/onboarding";
import ControlRoom from "./panels/control-room";
import CRM from "./panels/crm";
import Incidents from "./panels/incidents";
import Addresses from "./panels/addresses";
import Editorial from "./panels/articles";
import PWA from "./pwa";
import MobileNavigation, { type WorkspaceLink } from "./mobile-navigation";
import { PanelBoundary, PanelError } from "./panel-feedback";
import type { PanelKey } from "@/lib/panels";
import { siteHref } from "@/lib/deployment-links";
const nav = [
  {
    key: "articles",
    label: "مقالات و محتوا",
    icon: ClipboardList,
    only: ["operator"],
  },
  {
    key: "control",
    label: "اتاق کنترل و نقشه",
    icon: Route,
    only: ["operator"],
  },
  { key: "crm", label: "CRM و پیگیری‌ها", icon: Users, only: ["operator"] },
  {
    key: "onboarding",
    label: "پرونده و مدارک من",
    icon: ShieldCheck,
    only: ["driver"],
  },
  { key: "incidents", label: "رخدادها و مغایرت‌ها", icon: ClipboardList },
  { key: "addresses", label: "دفترچه نشانی", icon: Package, only: ["owner"] },
  { key: "dashboard", label: "نمای کلی", icon: LayoutDashboard },
  { key: "shipments", label: "محموله‌ها", icon: Package },
  { key: "market", label: "بازار بار", icon: Route, only: ["driver"] },
  { key: "team", label: "کاربران و ناوگان", icon: Users, only: ["operator"] },
  {
    key: "inspections",
    label: "مأموریت‌های بازرسی",
    icon: ShieldCheck,
    only: ["inspector", "operator"],
  },
  {
    key: "invoices",
    label: "امور مالی",
    icon: Wallet,
    only: ["owner", "driver", "operator"],
  },
  { key: "reports", label: "گزارش‌ها", icon: ChartNoAxesCombined },
  { key: "tickets", label: "مرکز پشتیبانی", icon: MessageSquare },
  {
    key: "complaints",
    label: "ثبت شکایت",
    icon: ShieldAlert,
    only: ["owner", "operator"],
  },
  {
    key: "owner-kyc",
    label: "احراز صاحب بار",
    icon: ShieldCheck,
    only: ["operator"],
  },
  {
    key: "operations",
    label: "رویدادها و درخواست‌ها",
    icon: ClipboardList,
    only: ["operator"],
  },
  { key: "notifications", label: "اعلان‌ها", icon: Bell },
  { key: "settings", label: "حساب کاربری", icon: Settings },
];
const appTabOrder: Record<Role, string[]> = {
  owner: ["shipments", "new", "invoices"],
  driver: ["shipments", "market", "onboarding"],
  operator: [
    "shipments",
    "control",
    "crm",
    "team",
    "invoices",
    "articles",
    "operations",
  ],
  inspector: ["shipments", "inspections", "incidents"],
};
const appPrimary: Record<Role, string> = {
  owner: "new",
  driver: "market",
  operator: "control",
  inspector: "inspections",
};
const appTabLabels: Record<string, string> = {
  dashboard: "خانه",
  onboarding: "مدارک",
  invoices: "مالی",
  control: "اتاق کنترل",
  crm: "پیگیری‌ها",
  team: "ناوگان",
  articles: "مقالات",
  operations: "رویدادها",
  inspections: "بازرسی",
  incidents: "رخدادها",
};
export default function Workspace({
  role,
  section,
  detailId,
}: {
  role: Role;
  section: string;
  detailId?: string;
}) {
  const router = useRouter(),
    base = "/" + panelPaths[role];
  const [demo, setDemo] = useState(false),
    [user, setUser] = useState<User | null>(null),
    [dash, setDash] = useState<Dash | null>(null),
    [shipments, setShipments] = useState<Page<Shipment> | null>(null),
    [shipment, setShipment] = useState<Shipment | null>(null),
    [invoices, setInvoices] = useState<Page<Invoice> | null>(null),
    [tickets, setTickets] = useState<Page<Ticket> | null>(null),
    [ticket, setTicket] = useState<Ticket | null>(null),
    [notices, setNotices] = useState<Page<Notice> | null>(null),
    [team, setTeam] = useState<User[]>([]),
    [ops, setOps] = useState<Ops | null>(null),
    [vehicle, setVehicle] = useState<Vehicle | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [modal, setModal] = useState<{ kind: string; data?: Invoice | Shipment }>(),
    [collapsed, setCollapsed] = useState(false),
    [dark, setDark] = useState(false);
  const isNew = detailId === "new";
  const [authError, setAuthError] = useState<unknown>(null),
    [authVersion, setAuthVersion] = useState(0);
  const requestVersion = useRef(0);
  const currentNav = nav.find((n) => n.key === section);
  const title =
    currentNav?.label ||
    (section === "driver-review" ? "بررسی پرونده راننده" : "نمای کلی");
  const backSection = section === "driver-review" ? "team" : section;
  const shipmentSection = ["market", "inspections"].includes(section)
    ? section
    : "shipments";
  const marketLocked = role === "driver" && !user?.driver_market_enabled;
  const refreshDriverAccess = useCallback((updated: User) => {
    setUser((current) =>
      current?.driver_market_enabled === updated.driver_market_enabled
        ? current
        : updated,
    );
  }, []);
  useEffect(() => {
    let alive = true;
    setAuthError(null);
    api<{ demo_enabled: boolean }>("auth/csrf/")
      .then((d) => setDemo(d.demo_enabled))
      .catch(() => {});
    api<User>("auth/me/")
      .then((u) => {
        if (!alive) return;
        if (u.role !== role) router.replace("/" + panelPaths[u.role] + "/app");
        else setUser(u);
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.code === "not_authenticated")
          router.replace(base + "/app");
        else setAuthError(e);
      });
    return () => {
      alive = false;
    };
  }, [role, router, authVersion, base]);
  useEffect(() => {
    if (user && section === "market" && marketLocked)
      router.replace(base + "/onboarding");
  }, [user, section, marketLocked, router, base]);
  useEffect(() => {
    setPage(1);
    setQuery("");
    setSearch("");
    setStatus("");
    setTicket(null);
    setShipment(null);
    setError("");
    requestVersion.current++;
  }, [section, detailId]);
  const load = useCallback(async () => {
    if (!user || (section === "market" && marketLocked)) return;
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    const current = () => version === requestVersion.current;
    const jobs: Promise<unknown>[] = [];
    jobs.push(
      api<Dash>("dashboard/").then((data) => {
        if (current()) setDash(data);
      }),
    );
    if (["shipments", "market", "inspections"].includes(section) && !isNew) {
      if (detailId)
        jobs.push(
          api<Shipment>("shipments/" + detailId + "/").then((data) => {
            if (current()) setShipment(data);
          }),
        );
      else
        jobs.push(
          api<Page<Shipment>>(
            "shipments/?page=" +
              page +
              "&q=" +
              encodeURIComponent(search) +
              "&status=" +
              encodeURIComponent(section === "market" ? "approved" : status) +
              (role === "driver" && section === "shipments" ? "&mine=1" : ""),
          ).then((data) => {
            if (current()) setShipments(data);
          }),
        );
    }
    if (section === "invoices")
      jobs.push(
        api<Page<Invoice>>("invoices/?page=" + page).then((data) => {
          if (current()) setInvoices(data);
        }),
      );
    if (section === "tickets")
      jobs.push(
        api<Page<Ticket>>("tickets/?page=" + page).then((data) => {
          if (current()) {
            setTickets(data);
            setTicket((previous) =>
              previous
                ? data.results.find((t) => t.id === previous.id) || previous
                : null,
            );
          }
        }),
      );
    if (section === "notifications")
      jobs.push(
        api<Page<Notice>>("notifications/?page=" + page).then((data) => {
          if (current()) setNotices(data);
        }),
      );
    if (section === "operations")
      jobs.push(
        api<Ops>("operations/").then((data) => {
          if (current()) setOps(data);
        }),
      );
    if (
      section === "team" ||
      (detailId &&
        role === "operator" &&
        ["shipments", "inspections"].includes(section))
    )
      jobs.push(
        api<User[]>("team/").then((data) => {
          if (current()) setTeam(data);
        }),
      );
    if (section === "settings" && role === "driver")
      jobs.push(
        api<Vehicle>("vehicle/").then((data) => {
          if (current()) setVehicle(data);
        }),
      );
    try {
      await Promise.all(jobs);
    } catch (e) {
      if (current()) {
        if (e instanceof ApiError && e.code === "not_authenticated")
          router.replace(base + "/app");
        else setError((e as Error).message);
      }
    } finally {
      if (current()) setLoading(false);
    }
  }, [
    user,
    section,
    detailId,
    isNew,
    page,
    search,
    status,
    role,
    router,
    base,
    marketLocked,
  ]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const storedTheme = localStorage.getItem("alamut-theme") === "dark";
    const storedMenu = localStorage.getItem("alamut-sidebar") === "collapsed";
    setDark(storedTheme);
    setCollapsed(storedMenu);
    document.documentElement.dataset.theme = storedTheme ? "dark" : "light";
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  async function mutate(
    path: string,
    data: unknown,
    success = "اطلاعات با موفقیت ثبت شد.",
  ) {
    setBusy(true);
    try {
      await api(path, "POST", data);
      if (success) setToast(success);
      await load();
      return true;
    } catch (e) {
      setToast((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submitted(path: string, data: unknown) {
    await api(path, "POST", data);
    setModal(undefined);
    setToast("اطلاعات با موفقیت ثبت شد.");
    await load();
  }
  async function logout() {
    try {
      await api("auth/logout/", "POST", {});
      window.location.assign(base + "/app");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function pager(count: number) {
    return (
      <div className="pagination">
        <span>
          {number(count)} مورد · صفحه {number(page)} از{" "}
          {number(Math.max(1, Math.ceil(count / 30)))}
        </span>
        <div>
          <button
            className="icon-btn"
            aria-label="صفحه قبل"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="icon-btn"
            aria-label="صفحه بعد"
            disabled={page * 30 >= count}
            onClick={() => setPage(page + 1)}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    );
  }
  function shipmentTable(rows: Shipment[]) {
    return rows.length ? (
      <div className="tw:overflow-x-auto tw:relative tw:max-w-full tw:min-w-0 tw:[overscroll-behavior-inline:contain] app-records shipment-table">
        <table role="table" aria-label="محموله‌ها">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader" scope="col">
                محموله
              </th>
              <th role="columnheader" scope="col">
                مسیر حمل
              </th>
              <th role="columnheader" scope="col">
                بارگیری
              </th>
              <th role="columnheader" scope="col">
                کرایه
              </th>
              <th role="columnheader" scope="col">
                وضعیت
              </th>
              <th role="columnheader" scope="col">
                <span className="tw:sr-only">جزئیات</span>
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.map((s) => (
              <tr role="row" key={s.id}>
                <td role="cell">
                  <Link
                    href={base + "/" + shipmentSection + "/" + s.id}
                    className="shipment-name tw:flex tw:items-center tw:gap-[11px] tw:below-760:gap-2"
                  >
                    <span className="tw:bg-[#f2f4eb] tw:border tw:border-[#e7ecde] tw:w-9 tw:h-9.5 tw:rounded-[7px] tw:text-[#829b70] tw:below-760:w-7.5 tw:below-760:h-8.5 tw:grid tw:place-items-center">
                      <Package size={19} />
                    </span>
                    <span>
                      <b>{s.title}</b>
                      <small dir="ltr">{s.code}</small>
                    </span>
                  </Link>
                </td>
                <td role="cell" data-label="مسیر حمل" data-wide="true">
                  <div className="table-route tw:flex tw:items-center tw:gap-2.5">
                    <span>{s.origin}</span>
                    <ArrowLeft size={12} />
                    <span>{s.destination}</span>
                  </div>
                  <small className="muted">
                    {vehicles[s.vehicle_type]} · {number(s.weight)} تن
                    <small className="muted">
                      {" "}
                      ({number(Math.round(Number(s.weight) * 1000))} کیلوگرم)
                    </small>
                  </small>
                </td>
                <td role="cell" data-label="بارگیری">
                  {date(s.pickup_date)}
                </td>
                <td role="cell" data-label="کرایه" className="nowrap">
                  {number(s.price)}
                  <small className="muted"> تومان</small>
                </td>
                <td role="cell" data-label="وضعیت">
                  <Badge status={s.status} />
                </td>
                <td role="cell" data-actions="true">
                  <Link
                    className="icon-btn"
                    href={base + "/" + shipmentSection + "/" + s.id}
                    aria-label={"جزئیات " + s.code}
                  >
                    <span className="app-record-action-label">جزئیات</span>
                    <ArrowUpLeft size={18} />
                  </Link>
                  {role === "owner" && (
                    <Link
                      className="text-link small"
                      href={base + "/shipments/new?repeat=" + s.id}
                    >
                      تکرار
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <Empty
        title={
          section === "market"
            ? "فعلاً باری آماده تخصیص نیست"
            : "محموله‌ای پیدا نشد"
        }
        text="با ثبت درخواست جدید یا تغییر فیلترها، مسیر تازه‌ای شروع کنید."
      />
    );
  }
  const capabilityNav: Record<string, string> = {
    shipments: "dispatch",
    inspections: "dispatch",
    incidents: "dispatch",
    invoices: "finance",
    articles: "content",
    crm: "crm",
    control: "monitoring",
    operations: "monitoring",
  };
  const visibleNav = nav.filter(
    (n) =>
      (!n.only || n.only.includes(role)) &&
      (n.key !== "market" || !marketLocked) &&
      (n.key !== "team" ||
        role !== "operator" ||
        Boolean(
          user?.capabilities.some((c) =>
            ["dispatch", "verification"].includes(c),
          ),
        )) &&
      (role !== "operator" ||
        !capabilityNav[n.key] ||
        Boolean(user?.capabilities.includes(capabilityNav[n.key]))),
  );
  const links: WorkspaceLink[] = visibleNav.map((item) => ({
    key: item.key,
    label:
      item.key === "shipments" && role === "driver" ? "سفرهای من" : item.label,
    icon: item.icon,
    href: base + (item.key === "dashboard" ? "/app" : "/" + item.key),
    active: item.key === section && !(role === "owner" && isNew),
    shortLabel: appTabLabels[item.key],
    primary: item.key === (marketLocked ? "onboarding" : appPrimary[role]),
  }));
  const newRequest: WorkspaceLink = {
    key: "new",
    label: "ثبت درخواست حمل",
    shortLabel: "ثبت بار",
    href: base + "/shipments/new",
    icon: Plus,
    active: isNew,
    primary: true,
  };
  if (role === "owner") links.push(newRequest);
  const tabs = ["dashboard", ...appTabOrder[role]]
    .flatMap((key) => links.filter((link) => link.key === key))
    .slice(0, 4);
  const mobileAction =
    tabs.find((tab) => tab.primary) ||
    tabs[1] ||
    links.find((link) => link.key === "settings");
  let content: ReactNode = null;
  if (section === "dashboard" && dash)
    content = (
      <Overview
        dash={dash}
        user={user}
        role={role}
        base={base}
        shipmentTable={shipmentTable}
        mobileAction={mobileAction}
      />
    );

  if (
    ["shipments", "market", "inspections"].includes(section) &&
    !(section === "market" && marketLocked)
  ) {
    if (isNew) {
      content = (
        <section className="card form-card request-form-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">شروع یک مسیر تازه</span>
              <h1>ثبت درخواست حمل</h1>
              <p>اطلاعات دقیق، پایه یک حمل مطمئن است.</p>
            </div>
            <Link className="text-link desktop-back" href={base + "/shipments"}>
              بازگشت
              <ArrowLeft size={17} />
            </Link>
          </div>
          {role === "owner" && user ? (
            <OwnerShipmentWizard
              user={user}
              demo={demo}
              base={base}
              onDone={(s) => {
                setToast("درخواست حمل ثبت شد.");
                router.push(base + "/shipments/" + s.id);
              }}
            />
          ) : (
            <ShipmentForm
              onDone={(s) => {
                setToast("درخواست حمل ثبت شد.");
                router.push(base + "/shipments/" + s.id);
              }}
            />
          )}
        </section>
      );
    } else if (detailId && shipment)
      content = (
        <ShipmentDetail
          shipment={shipment}
          user={user}
          role={role}
          backHref={base + "/" + shipmentSection}
          busy={busy}
          setBusy={setBusy}
          setToast={setToast}
          setModal={setModal}
          mutate={mutate}
        />
      );
    else if (shipments)
      content = (
        <>
          <div className="page-heading">
            <div>
              <h1>
                {section === "market"
                  ? "فرصت‌های تازه در مسیر شما"
                  : section === "inspections"
                    ? "مأموریت‌های بازرسی"
                    : role === "driver"
                      ? "سفرهای من"
                      : "مدیریت محموله‌ها"}
              </h1>
              <p>از اولین هماهنگی تا تحویل نهایی، جزئیات در دسترس شماست.</p>
            </div>
            {["owner", "operator"].includes(role) && (
              <Link className="btn" href={base + "/shipments/new"}>
                <Plus size={18} />
                درخواست حمل جدید
              </Link>
            )}
          </div>
          <div className="card">
            <div className="list-toolbar tw:py-5 tw:px-[23px] tw:flex tw:gap-3.5 tw:items-center tw:below-1200:flex-wrap tw:below-760:p-[15px] tw:below-760:gap-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setSearch(query);
                }}
                className="search-field tw:flex tw:items-center tw:gap-2 tw:bg-[#f8f9f3] tw:border tw:border-line tw:rounded-[7px] tw:py-0 tw:px-3 tw:max-w-[400px] tw:w-full tw:text-[#97a18d] tw:below-1200:max-w-full tw:below-760:text-[10px]"
              >
                <Search size={18} />
                <input
                  aria-label="جستجوی محموله"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="کد، نام محموله یا شهر…"
                />
                <button type="submit" className="text-link">
                  جستجو
                </button>
              </form>
              {section !== "market" && (
                <select
                  aria-label="فیلتر وضعیت"
                  value={status}
                  onChange={(e) => {
                    setPage(1);
                    setStatus(e.target.value);
                  }}
                >
                  <option value="">همه وضعیت‌ها</option>
                  {Object.entries(statuses).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
              <a
                className="secondary-btn"
                href={
                  "/api/shipments/export/?q=" +
                  encodeURIComponent(search) +
                  "&status=" +
                  encodeURIComponent(status) +
                  (role === "driver" && section === "shipments"
                    ? "&mine=1"
                    : "")
                }
              >
                <Download size={16} />
                خروجی CSV
              </a>
            </div>
            {shipmentTable(shipments.results)}
            {pager(shipments.count)}
          </div>
        </>
      );
  }
  if (section === "invoices" && invoices)
    content = (
      <Finance
        reload={load}
        invoices={invoices}
        dash={dash}
        role={role}
        base={base}
        pager={pager}
        setModal={setModal}
      />
    );

  if (section === "reports" && dash)
    content = (
      <Reports
        dash={dash}
        canExport={
          role !== "operator" ||
          Boolean(user?.capabilities.includes("dispatch"))
        }
      />
    );

  if (section === "tickets" && tickets)
    content = (
      <Support
        tickets={tickets}
        ticket={ticket}
        setTicket={setTicket}
        pager={pager}
        setModal={setModal}
        mutate={mutate}
        load={load}
      />
    );

  if (section === "notifications" && notices)
    content = (
      <Notifications
        notices={notices}
        busy={busy}
        mutate={mutate}
        base={base}
        pager={pager}
      />
    );

  if (section === "team")
    content = (
      <Team
        team={team}
        busy={busy}
        mutate={mutate}
        canVerify={Boolean(user?.capabilities.includes("verification"))}
      />
    );

  if (section === "operations" && ops) content = <Operations ops={ops} />;

  if (section === "settings" && user)
    content = (
      <Account
        user={user}
        role={role}
        vehicle={vehicle}
        setVehicle={setVehicle}
        setUser={setUser}
        setToast={setToast}
      />
    );

  if (section === "onboarding" && role === "driver")
    content = <Onboarding onUserChange={refreshDriverAccess} />;
  if (section === "driver-review" && role === "operator" && detailId)
    content = <Onboarding driverId={detailId} />;
  if (section === "control" && role === "operator") content = <ControlRoom />;
  if (section === "articles" && role === "operator") content = <Editorial />;
  if (section === "crm" && role === "operator") content = <CRM />;
  if (section === "incidents") content = <Incidents role={role} />;
  if (section === "addresses" && role === "owner") content = <Addresses />;
  if (section === "complaints" && ["owner", "operator"].includes(role))
    content = <Complaints role={role} />;
  if (section === "owner-kyc" && role === "operator")
    content = <OwnerKycReview />;
  if (role === "owner" && user && !nationalIdOk(user.national_id))
    content = <NationalIdGate onSaved={setUser} />;
  return (
    <div
      className={"workspace tw:min-h-[100svh] tw:flex tw:bg-[#f6f7f3]" + (collapsed ? " menu-collapsed" : "")}
      data-role={role}
      data-section={section}
    >
      <aside className="sidebar tw:w-60.5 tw:shrink-0 tw:bg-[#fffef9] tw:border-l tw:border-l-line tw:fixed tw:right-0 tw:top-0 tw:bottom-0 tw:z-30 tw:flex tw:flex-col tw:py-0 tw:px-[17px] tw:wide:w-65 tw:below-1200:w-[215px] tw:below-1200:py-0 tw:below-1200:px-3">
        <div className="sidebar-brand tw:pt-[29px] tw:px-[17px] tw:pb-6 tw:flex tw:justify-between tw:items-center">
          <Brand />
          <button
            type="button"
            className="icon-btn"
            aria-label="جمع کردن منو"
            onClick={() => {
              setCollapsed(true);
              localStorage.setItem("alamut-sidebar", "collapsed");
            }}
          >
            <PanelRight size={18} />
          </button>
        </div>
        <div className="workspace-label tw:flex tw:items-center tw:gap-2 tw:border tw:border-[#e1e8dc] tw:bg-[#f5f7ef] tw:mt-0 tw:mx-[7px] tw:mb-[25px] tw:py-2.5 tw:px-3 tw:rounded-[7px] tw:text-[11px]">
          <span className="tw:inline-block tw:w-1.5 tw:h-1.5 tw:rounded-full tw:bg-brand tw:shrink-0" />
          {roles[role]}
          <small>فضای کار شما</small>
        </div>
        <nav aria-label="منوی پنل">
          {visibleNav.map((n) => (
            <Link
              key={n.key}
              href={base + (n.key === "dashboard" ? "/app" : "/" + n.key)}
              className={section === n.key ? "active" : ""}
              aria-current={section === n.key ? "page" : undefined}
            >
              <n.icon size={20} strokeWidth={1.7} />
              <span>{n.label}</span>
              {n.key === "notifications" && !!dash?.notifications && (
                <small>{number(dash.notifications)}</small>
              )}
              {section === n.key && <i />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom tw:mt-auto tw:pt-4 tw:shrink-0">
          <div className="sidebar-help tw:bg-[#f1f3e9] tw:border tw:border-[#e8ebdf] tw:rounded-[9px] tw:text-center tw:pt-5 tw:px-2.5 tw:pb-4 tw:mt-0 tw:mx-1.5 tw:mb-[17px] tw:text-[#557653] tw:below-1200:py-4 tw:below-1200:px-2">
            <ShieldCheck size={25} strokeWidth={1.4} />
            <b>همراه شما در مسیر</b>
            <p>سؤالی دارید؟ ما اینجاییم.</p>
            <Link href={base + "/tickets"}>
              گفت‌وگو با پشتیبانی <ArrowLeft size={15} />
            </Link>
          </div>
          <button className="tw:flex tw:items-center tw:gap-[13px] tw:text-[#91968a] tw:bg-transparent tw:py-3.5 tw:px-[23px] tw:border-t tw:border-t-line tw:w-full tw:text-[11px]" onClick={() => void logout()}>
            <LogOut size={18} />
            خروج از حساب
          </button>
        </div>
      </aside>
      <div className="workspace-body tw:mr-60.5 tw:min-w-0 tw:flex-1 tw:flex tw:flex-col tw:wide:mr-65 tw:below-1200:mr-[215px] tw:below-760:mr-0">
        <header className="workspace-header tw:h-20 tw:bg-[#fffefa] tw:border-b tw:border-b-line tw:py-0 tw:px-10 tw:flex tw:justify-between tw:items-center tw:gap-5 tw:wide:py-0 tw:wide:px-[55px] tw:below-1200:py-0 tw:below-1200:px-6 tw:below-760:h-[67px] tw:below-760:py-0 tw:below-760:px-4 tw:below-760:gap-1.5">
          <div className="desktop-crumb">
            <span className="muted">فضای کار {roles[role]}</span>
            <ChevronLeft size={13} />
            <b>{title}</b>
          </div>
          <div className="app-heading">
            {detailId ? (
              <Link
                className="icon-btn app-back"
                href={base + "/" + backSection}
                aria-label="بازگشت به فهرست"
              >
                <ChevronRight size={24} />
              </Link>
            ) : (
              <span className="app-mark">
                <Mountain size={24} strokeWidth={1.5} />
              </span>
            )}
            <span className="app-heading-copy">
              <small>الموت · {roles[role]}</small>
              <b>{isNew ? "ثبت درخواست حمل" : title}</b>
            </span>
          </div>
          <div>
            <button
              type="button"
              className="icon-btn"
              aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
              onClick={() => {
                const next = !collapsed;
                setCollapsed(next);
                localStorage.setItem(
                  "alamut-sidebar",
                  next ? "collapsed" : "open",
                );
              }}
            >
              <PanelRight size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={dark ? "زمینه روشن" : "زمینه تیره"}
              onClick={() => {
                const next = !dark;
                setDark(next);
                document.documentElement.dataset.theme = next ? "dark" : "light";
                localStorage.setItem("alamut-theme", next ? "dark" : "light");
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                void load();
                window.dispatchEvent(new CustomEvent("alamut:refresh"));
              }}
              aria-label="تازه‌سازی"
            >
              <RefreshCw size={18} />
            </button>
            <Link
              className="icon-btn notification-btn tw:relative tw:text-[#71816d]"
              href={base + "/notifications"}
              aria-label="اعلان‌ها"
              aria-current={section === "notifications" ? "page" : undefined}
            >
              <Bell size={20} />
              {!!dash?.notifications && <i />}
            </Link>
            <span className="header-divider tw:below-760:my-0 tw:below-760:mx-1.5 tw:h-7 tw:w-px tw:bg-line tw:my-0 tw:mx-[5px]" />
            <Link
              className="header-user tw:flex tw:items-center tw:gap-2.5"
              href={base + "/settings"}
              aria-label={
                user ? "حساب کاربری «" + user.name + "»" : "حساب کاربری"
              }
            >
              <span className="avatar tw:w-[35px] tw:h-[35px] tw:bg-[#e9eddf] tw:border tw:border-[#e0e6d6] tw:text-[#687c56] tw:rounded-full tw:grid tw:place-items-center tw:font-semibold" aria-hidden="true">
                {user?.first_name?.[0] || "م"}
              </span>
              <span>
                <b>{user?.name || "حساب کاربری"}</b>
                <small>{roles[role]}</small>
              </span>
            </Link>
          </div>
        </header>
        <main id="main" className="workspace-main tw:w-full tw:my-0 tw:mx-auto tw:pt-[33px] tw:px-10 tw:flex-1 tw:wide:py-[43px] tw:wide:px-[55px] tw:below-1200:py-6.5 tw:below-1200:px-6 tw:below-760:pt-[25px] tw:below-760:px-[17px] tw:below-760:pb-[35px] tw:max-w-[1640px] tw:pb-[max(32px,env(safe-area-inset-bottom))]">
          <PWA panel={panelPaths[role] as PanelKey} />
          {authError ? (
            <PanelError
              error={authError}
              retry={() => setAuthVersion((v) => v + 1)}
            />
          ) : null}
          {demo && (
            <p className="demo-banner tw:bg-[#f0f3e8] tw:border tw:border-dashed tw:border-[#dce4cf] tw:py-[7px] tw:px-3 tw:rounded-[6px] tw:mb-5 tw:below-760:mb-4.5 tw:text-[#64745e] tw:text-[11px]">
              محیط آزمایشی · حساب‌ها و محموله‌های اولیه، داده نمونه هستند.
            </p>
          )}
          {authError ? null : error ? (
            <div className="error-state tw:p-15 tw:text-center">
              <h2>دریافت اطلاعات انجام نشد</h2>
              <p className="error" role="alert">
                {error}
              </p>
              <button className="btn" onClick={() => void load()}>
                تلاش مجدد
              </button>
            </div>
          ) : loading || (section === "market" && marketLocked) ? (
            <Loading />
          ) : (
            <PanelBoundary key={section + String(detailId)}>
              {content || (
                <Empty
                  title="این صفحه در دسترس نقش شما نیست"
                  action={
                    <Link className="btn" href={base}>
                      نمای کلی
                    </Link>
                  }
                />
              )}
            </PanelBoundary>
          )}
        </main>
        <footer className="workspace-footer tw:flex tw:justify-between tw:border-t tw:border-t-[#e4e9dd] tw:py-[15px] tw:px-10 tw:below-760:py-3.5 tw:below-760:px-[17px] tw:text-[#64745e] tw:text-[12px]">
          <span>الموت · هر مسیر، یک تعهد است.</span>
          <Link href={siteHref("/help#" + role)}>راهنمای پنل</Link>
        </footer>
      </div>
      {user && (
        <MobileNavigation
          key={section + ":" + (detailId || "")}
          tabs={tabs}
          links={links}
          help={siteHref("/help#" + role)}
          onLogout={logout}
        />
      )}
      {toast && (
        <div className="toast tw:fixed tw:bottom-[25px] tw:left-7.5 tw:z-100 tw:bg-[#1b493f] tw:text-[#f1f5e9] tw:shadow-[0_10px_45px_#163c3726] tw:py-[15px] tw:px-[17px] tw:rounded-[10px] tw:flex tw:items-center tw:gap-5 tw:text-[12px] tw:max-w-[min(600px,calc(100%_-_40px))] tw:below-760:left-[17px] tw:below-760:bottom-[17px] tw:below-760:text-[11px] tw:below-760:py-3 tw:below-760:px-3.5" role="status">
          <span>{toast}</span>
          <button
            className="icon-btn"
            onClick={() => setToast("")}
            aria-label="بستن پیام"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          wide={modal.kind === "edit"}
          title={
            (
              {
                assign: "تخصیص راننده و متصدی",
                offer: "پیشنهاد حمل",
                cancel: "لغو درخواست حمل",
                inspect: "چک‌لیست بازرسی",
                settle: "ثبت تسویه صورتحساب",
                ticket: "درخواست پشتیبانی جدید",
                edit: "ویرایش درخواست حمل",
              } as Record<string, string>
            )[modal.kind]
          }
          onClose={() => setModal(undefined)}
        >
          {modal.kind === "edit" && (
            <ShipmentForm
              shipment={modal.data as Shipment}
              onDone={async () => {
                setModal(undefined);
                await load();
              }}
            />
          )}
          {modal.kind === "assign" && (
            <ActionForm
              fields={[
                {
                  name: "driver",
                  label: "راننده احراز شده",
                  required: true,
                  full: true,
                  options: team
                    .filter(
                      (u) => u.role === "driver" && u.driver_market_enabled,
                    )
                    .map((u) => ({
                      value: String(u.id),
                      label:
                        u.name +
                        " · " +
                        (u.vehicle
                          ? vehicles[u.vehicle.kind] +
                            " / " +
                            number(u.vehicle.capacity) +
                            " تن"
                          : "بدون خودرو"),
                    })),
                },
                {
                  name: "inspector",
                  label: "متصدی بازرسی",
                  required: true,
                  full: true,
                  options: team
                    .filter((u) => u.role === "inspector")
                    .map((u) => ({ value: String(u.id), label: u.name })),
                },
              ]}
              onSubmit={(d) =>
                submitted("shipments/" + modal.data?.id + "/assign/", d)
              }
            >
              <p className="info-note">
                ظرفیت، نوع خودرو و سفر فعال راننده در سرور بررسی می‌شود. در صورت
                وجود پیشنهاد، کرایه پیشنهادی همان راننده ثبت می‌شود.
              </p>
            </ActionForm>
          )}
          {modal.kind === "offer" && (
            <ActionForm
              fields={[
                {
                  name: "amount",
                  label: "کرایه پیشنهادی (تومان)",
                  type: "number",
                  min: 1000,
                  required: true,
                  full: true,
                  value: (modal.data as Shipment)?.price,
                },
                {
                  name: "note",
                  label: "توضیحات پیشنهاد",
                  type: "textarea",
                  full: true,
                  maxLength: 500,
                },
              ]}
              onSubmit={(d) =>
                submitted("shipments/" + modal.data?.id + "/offer/", d)
              }
            />
          )}
          {modal.kind === "cancel" && (
            <ActionForm
              fields={[
                {
                  name: "note",
                  label: "دلیل لغو (حداقل ۵ نویسه)",
                  type: "textarea",
                  full: true,
                  required: true,
                  maxLength: 1000,
                },
              ]}
              submit="ثبت لغو درخواست"
              onSubmit={async (d) => {
                if (d.note.trim().length < 5)
                  throw new Error("دلیل لغو حداقل ۵ نویسه باشد.");
                await submitted("shipments/" + modal.data?.id + "/transition/", {
                  ...d,
                  status: "cancelled",
                });
              }}
            />
          )}
          {modal.kind === "inspect" && (
            <ActionForm
              fields={[
                {
                  name: "seal_number",
                  label: "شماره پلمب",
                  required: true,
                  full: true,
                  maxLength: 60,
                },
                ...["packaging_ok", "weight_ok", "vehicle_ok"].map(
                  (name, i) => ({
                    name,
                    label: [
                      "سلامت بسته‌بندی",
                      "تطبیق وزن و کالا",
                      "آمادگی و سلامت خودرو",
                    ][i],
                    required: true,
                    full: true,
                    options: [
                      { value: "true", label: "تأیید می‌شود" },
                      { value: "false", label: "نیازمند اصلاح است" },
                    ],
                  }),
                ),
                {
                  name: "notes",
                  label: "یادداشت بازرسی",
                  type: "textarea",
                  full: true,
                },
              ]}
              submit="ثبت گزارش بازرسی"
              onSubmit={(d) =>
                submitted("shipments/" + modal.data?.id + "/inspect/", {
                  ...d,
                  stage:
                    (modal.data as Shipment).status === "loading"
                      ? "loading"
                      : "delivery",
                  packaging_ok: d.packaging_ok === "true",
                  weight_ok: d.weight_ok === "true",
                  vehicle_ok: d.vehicle_ok === "true",
                })
              }
            />
          )}
          {modal.kind === "settle" && (
            <ActionForm
              fields={[
                {
                  name: "reference",
                  label: "شماره مرجع پرداخت انجام‌شده",
                  required: true,
                  full: true,
                  maxLength: 100,
                },
              ]}
              submit="ثبت تسویه"
              onSubmit={(d) =>
                submitted("invoices/" + modal.data?.id + "/settle/", d)
              }
            >
              <p className="info-note">
                مبلغ: {money((modal.data as Invoice).amount)}. این اقدام، ثبت
                پرداخت انجام‌شده در حسابداری است و انتقال وجه انجام نمی‌دهد.
              </p>
            </ActionForm>
          )}
          {modal.kind === "ticket" && (
            <ActionForm
              fields={[
                {
                  name: "subject",
                  label: "موضوع درخواست",
                  required: true,
                  full: true,
                },
                {
                  name: "priority",
                  label: "اولویت",
                  required: true,
                  full: true,
                  value: "normal",
                  options: [
                    { value: "normal", label: "عادی" },
                    { value: "urgent", label: "فوری" },
                  ],
                },
                {
                  name: "body",
                  label: "توضیح درخواست",
                  type: "textarea",
                  required: true,
                  full: true,
                  maxLength: 4000,
                },
              ]}
              onSubmit={(d) => submitted("tickets/", d)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}
