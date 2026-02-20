import { mixpanel } from "metabase/plugins/mixpanel";

import {
  AdminNavLink,
  AdminNavListItem,
  ExternalNavLink,
} from "./AdminNavItem.styled";

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
          onClick={() => mixpanel.trackEvent(mixpanel.events.access_people)}
          rel="noreferrer"
          target="_blank"
          href="https://app.dadosfera.ai/settings/access-management?from=metabase"
        >
          <ExternalNavLink>{name}</ExternalNavLink>
        </a>
      </AdminNavListItem>
      // <li>
      //   <a
      //     // onClick={() => mixpanel.trackEvent(mixpanel.events.access_people)}
      //     rel="noreferrer"
      //     target="_blank"
      //     href=
      //   >
      //     <ExternalNavLink>{name}</ExternalNavLink>
      //   </a>
      // </li>
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
