/* eslint-disable react/prop-types */
import moment from "moment-timezone"; // eslint-disable-line no-restricted-imports -- deprecated usage
import { Fragment, useMemo } from "react";
import { t } from "ttag";

import EntityMenu from "metabase/components/EntityMenu";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import UserAvatar from "metabase/components/UserAvatar";
import { Icon } from "metabase/core/components/Icon";
import Tooltip from "metabase/core/components/Tooltip";
import { color } from "metabase/lib/colors";
import { useSelector } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { getFullName } from "metabase/lib/user";
import { PLUGIN_ADMIN_USER_MENU_ITEMS } from "metabase/plugins";
import { getSetting } from "metabase/selectors/settings";

import MembershipSelect from "./MembershipSelect";
import { RefreshLink } from "./PeopleListRow.styled";

const enablePasswordLoginKey = "enable-password-login";

const PeopleListRow = ({
  user,
  showDeactivated,
  groups,
  userMemberships,
  isCurrentUser,
  isAdmin,
  onAdd,
  onRemove,
  onChange,
}) => {
  const membershipsByGroupId = useMemo(
    () =>
      userMemberships?.reduce((acc, membership) => {
        acc.set(membership.group_id, membership);
        return acc;
      }, new Map()),
    [userMemberships],
  );

  const isLoadingGroups = !groups;

  const isPasswordLoginEnabled = useSelector(state =>
    getSetting(state, enablePasswordLoginKey),
  );

  return (
    <tr key={user.id}>
      <td className="flex align-center">
        <span className="text-white inline-block">
          <UserAvatar
            bg={user.is_superuser ? color("accent2") : color("brand")}
            user={user}
          />
        </span>{" "}
        <span className="ml2 text-bold">{getName(user)}</span>
      </td>
      <td>
        {user.google_auth ? (
          <Tooltip tooltip={t`Signed up via Google`}>
            <Icon name="google" />
          </Tooltip>
        ) : null}
        {user.ldap_auth ? (
          <Tooltip tooltip={t`Signed up via LDAP`}>
            <Icon name="ldap" />
          </Tooltip>
        ) : null}
      </td>
      <td>{user.email}</td>
      {showDeactivated ? (
        <Fragment>
          <td>{moment(user.updated_at).fromNow()}</td>
          <td>
            <Tooltip tooltip={t`Reactivate this account`}>
              <RefreshLink to={Urls.reactivateUser(user.id)}>
                <Icon name="refresh" size={20} />
              </RefreshLink>
            </Tooltip>
          </td>
        </Fragment>
      ) : (
        <Fragment>
          <td>
            {isLoadingGroups ? (
              <LoadingSpinner />
            ) : (
              <MembershipSelect
                groups={groups}
                memberships={membershipsByGroupId}
                isCurrentUser={isCurrentUser}
                isUserAdmin={user.is_superuser}
                onAdd={onAdd}
                onRemove={onRemove}
                onChange={onChange}
              />
            )}
          </td>
          <td>
            {user.last_login ? moment(user.last_login).fromNow() : t`Never`}
          </td>
          <td className="text-right">
            {isAdmin && (
              <EntityMenu
                triggerIcon="ellipsis"
                items={[
                  {
                    title: t`Edit user`,
                    link: Urls.editUser(user.id),
                  },
                  isPasswordLoginEnabled && {
                    title: t`Reset password`,
                    link: Urls.resetPassword(user.id),
                  },
                  ...PLUGIN_ADMIN_USER_MENU_ITEMS.flatMap(getItems =>
                    getItems(user),
                  ),
                  !isCurrentUser && {
                    title: t`Deactivate user`,
                    link: Urls.deactivateUser(user.id),
                  },
                ]}
              />
            )}
          </td>
        </Fragment>
      )}
    </tr>
  );
};

/**
 *
 * @param {import("metabase-types/api").User} user
 * @returns {string}
 */
function getName(user) {
  const name = getFullName(user);

  if (!name) {
    return "-";
  }

  return name;
}

export default PeopleListRow;
