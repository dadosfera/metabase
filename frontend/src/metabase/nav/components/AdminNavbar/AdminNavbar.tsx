import { useClickOutside } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { push } from "react-router-redux";
import { t } from "ttag";

import { Link } from "metabase/common/components/Link";
import { LogoIcon } from "metabase/common/components/LogoIcon";
import { useRegisterShortcut } from "metabase/palette/hooks/useRegisterShortcut";
import { PLUGIN_SECURITY_CENTER } from "metabase/plugins";
import { useDispatch } from "metabase/redux";
import type { AdminPath } from "metabase/redux/store";
import { Box, Button, Flex, Group, Icon } from "metabase/ui";

import { ADMIN_NAVBAR_HEIGHT } from "../../constants";
import { AppSwitcher } from "../AppSwitcher";

import { AdminNavItem } from "./AdminNavItem";
import { AdminNavLink } from "./AdminNavLink";
import S from "./AdminNavbar.module.css";

// [Dadosfera] Seções de admin gerenciadas pela plataforma Dadosfera ficam ocultas.
const HIDDEN_ADMIN_PATH_KEYS = ["troubleshooting", "permissions", "tools"];

const getVisibleAdminPaths = (adminPaths: AdminPath[]) =>
  adminPaths.filter((path) => !HIDDEN_ADMIN_PATH_KEYS.includes(path.key));

interface AdminNavbarProps {
  path: string;
  adminPaths: AdminPath[];
}

export const AdminNavbar = ({
  path: currentPath,
  adminPaths: allAdminPaths,
}: AdminNavbarProps) => {
  const adminPaths = useMemo(
    () => getVisibleAdminPaths(allAdminPaths),
    [allAdminPaths],
  );
  const dispatch = useDispatch();

  useRegisterShortcut(
    [
      {
        id: "admin-change-tab",
        perform: (_, event) => {
          if (!event?.key) {
            return;
          }
          const key = parseInt(event.key);
          const path = adminPaths[key - 1]?.path;

          if (path) {
            dispatch(push(path));
          }
        },
      },
    ],
    [adminPaths],
  );

  return (
    <Flex
      component="nav"
      className={S.AdminNavbarRoot}
      data-element-id="navbar-root"
      data-testid="admin-navbar"
      aria-label={t`Navigation bar`}
      align="center"
      justify="space-between"
      h={ADMIN_NAVBAR_HEIGHT}
      bg="admin-navbar"
      fz="0.85rem"
      px="1rem"
      py="0.5rem"
      style={{ zIndex: 4, flexShrink: 0 }}
    >
      <Flex
        component={Link}
        to="/admin"
        align="center"
        justify="center"
        miw={32}
        maw="20rem"
        h={32}
        style={{ overflow: "hidden" }}
      >
        <LogoIcon dark />
        <Box
          visibleFrom="lg"
          fw={700}
          ml="1rem"
          // eslint-disable-next-line metabase/no-literal-metabase-strings -- Metabase settings
        >{t`Metabase Admin`}</Box>
        <Box
          visibleFrom="lg"
          ml="1rem"
          // eslint-disable-next-line i18next/no-literal-string -- Dadosfera branding
        >Accelerated By Dadosfera</Box>
      </Flex>

      <Flex visibleFrom="md" align="center" miw={0} flex="1 1 auto" ps="2rem">
        <Flex
          component="ul"
          data-testid="admin-navbar-items"
          gap="0.25rem"
          miw={0}
        >
          {adminPaths.map(({ name, key, path }) => (
            <AdminNavItem
              name={name}
              path={path}
              key={key}
              currentPath={currentPath}
            />
          ))}
          {/* Security Center is rendered outside adminPaths because it
              needs a live query to show an active-advisories badge */}
          {PLUGIN_SECURITY_CENTER.isEnabled && (
            <PLUGIN_SECURITY_CENTER.SecurityCenterNavItem
              currentPath={currentPath}
            />
          )}
        </Flex>

      </Flex>
      <Group gap="0.5rem" ms="auto">
        <MobileNavbar adminPaths={adminPaths} currentPath={currentPath} />
        <AppSwitcher />
      </Group>
    </Flex>
  );
};

interface AdminMobileNavbarProps {
  adminPaths: AdminPath[];
  currentPath: string;
}

const MobileNavbar = ({ adminPaths, currentPath }: AdminMobileNavbarProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const ref = useClickOutside(() => setMobileNavOpen(false));

  return (
    <Group ref={ref} hiddenFrom="md" gap="0.5rem" align="center">
      <Button
        onClick={() => setMobileNavOpen((prev) => !prev)}
        variant="subtle"
        p="0.25rem"
        leftSection={
          <Icon name="burger" size={32} color="text-primary-inverse" />
        }
      />

      {mobileNavOpen && (
        <Flex
          component="ul"
          aria-label={t`Navigation links`}
          direction="column"
          ta="right"
          p="md"
          gap="sm"
          miw="12rem"
          pos="fixed"
          top={ADMIN_NAVBAR_HEIGHT}
          right={0}
          bg="admin-navbar"
          mah={`calc(100vh - ${ADMIN_NAVBAR_HEIGHT})`}
          bdrs="0 0 0 0.5rem"
          style={{ overflowY: "auto" }}
        >
          {adminPaths.map(({ name, key, path }) => (
            <AdminNavLink
              to={path}
              key={key}
              isSelected={currentPath.startsWith(path)}
              isInMobileNav
            >
              {name}
            </AdminNavLink>
          ))}
          {/* Security Center is rendered outside adminPaths because it
              needs a live query to show an active-advisories badge */}
          {PLUGIN_SECURITY_CENTER.isEnabled && (
            <PLUGIN_SECURITY_CENTER.SecurityCenterMobileNavItem
              currentPath={currentPath}
            />
          )}
        </Flex>
      )}
    </Group>
  );
};
