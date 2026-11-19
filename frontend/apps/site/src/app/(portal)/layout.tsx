import type { ReactNode } from "react";
import "./panel-styles.css";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <div className="portal-page">{children}</div>;
}
