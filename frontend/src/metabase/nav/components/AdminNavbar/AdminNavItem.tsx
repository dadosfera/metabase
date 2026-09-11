import { mixpanel } from "metabase/plugins/mixpanel";

import S from "./AdminNavbar.module.css";
import { AdminNavLink, AdminNavListItem } from "./AdminNavLink";

// [Dadosfera] Usuários são gerenciados na plataforma Dadosfera.
const DADOSFERA_ACCESS_MANAGEMENT_URL =
  "https://app.dadosfera.ai/settings/access-management?from=metabase";

interface AdminNavItemProps {
  name: string;
  path: string;
  currentPath: string;
}

export const AdminNavItem = ({
  name,
  path,
  currentPath,
}: AdminNavItemProps) => {
  if (path === "/admin/people") {
    return (
      <AdminNavListItem path={path} currentPath={currentPath}>
        <a
          className={S.AdminNavLink}
          onClick={() => mixpanel.trackEvent(mixpanel.events.access_people)}
          rel="noreferrer"
          target="_blank"
          href={DADOSFERA_ACCESS_MANAGEMENT_URL}
        >
          {name}
        </a>
      </AdminNavListItem>
    );
  }

  return (
    <AdminNavListItem path={path} currentPath={currentPath}>
      <AdminNavLink to={path} isSelected={currentPath.startsWith(path)}>
        {name}
      </AdminNavLink>
    </AdminNavListItem>
  );
};
