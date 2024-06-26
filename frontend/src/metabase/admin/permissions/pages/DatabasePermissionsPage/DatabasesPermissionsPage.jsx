import { bindActionCreators } from "@reduxjs/toolkit";
import PropTypes from "prop-types";
import { Fragment, useCallback } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { t } from "ttag";
import _ from "underscore";

import {
  PermissionsEditor,
  PermissionsEditorEmptyState,
  permissionEditorPropTypes,
} from "../../components/PermissionsEditor";
import { PermissionsSidebar } from "../../components/PermissionsSidebar";
import { updateDataPermission } from "../../permissions";
import {
  getGroupsDataPermissionEditor,
  getDataFocusSidebar,
  getIsLoadingDatabaseTables,
  getLoadingDatabaseTablesError,
} from "../../selectors/data-permissions";
import {
  DATABASES_BASE_PATH,
  getDatabaseFocusPermissionsUrl,
} from "../../utils/urls";

const mapDispatchToProps = dispatch => ({
  dispatch,
  ...bindActionCreators(
    {
      updateDataPermission,
      switchView: entityType => push(`/admin/permissions/data/${entityType}`),
      navigateToDatabaseList: () => push(DATABASES_BASE_PATH),
      navigateToItem: item =>
        push(getDatabaseFocusPermissionsUrl(item.entityId)),
    },
    dispatch,
  ),
});

const mapStateToProps = (state, props) => {
  return {
    sidebar: getDataFocusSidebar(state, props),
    permissionEditor: getGroupsDataPermissionEditor(state, props),
    isSidebarLoading: getIsLoadingDatabaseTables(state, props),
    sidebarError: getLoadingDatabaseTablesError(state, props),
  };
};

const propTypes = {
  params: PropTypes.shape({
    databaseId: PropTypes.string,
    schemaName: PropTypes.string,
    tableId: PropTypes.string,
  }),
  children: PropTypes.node,
  sidebar: PropTypes.object,
  permissionEditor: PropTypes.shape(permissionEditorPropTypes),
  navigateToItem: PropTypes.func.isRequired,
  switchView: PropTypes.func.isRequired,
  updateDataPermission: PropTypes.func.isRequired,
  navigateToDatabaseList: PropTypes.func.isRequired,
  isSidebarLoading: PropTypes.bool,
  sidebarError: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

function DatabasesPermissionsPage({
  sidebar,
  permissionEditor,
  params,
  children,
  navigateToItem,
  navigateToDatabaseList,
  switchView,
  updateDataPermission,
  dispatch,
  isSidebarLoading,
  sidebarError,
}) {
  const handleEntityChange = useCallback(
    entityType => {
      switchView(entityType);
    },
    [switchView],
  );

  const handlePermissionChange = useCallback(
    async (item, permission, value) => {
      await updateDataPermission({
        groupId: item.id,
        permission,
        value,
        entityId: item.entityId,
        view: "database",
      });
    },
    [updateDataPermission],
  );

  const handleAction = (action, item) => {
    dispatch(action.actionCreator(item.entityId, item.id, "database"));
  };

  const handleBreadcrumbsItemSelect = item => dispatch(push(item.url));

  return (
    <Fragment>
      <PermissionsSidebar
        {...sidebar}
        error={sidebarError}
        isLoading={isSidebarLoading}
        onSelect={navigateToItem}
        onBack={params.databaseId == null ? null : navigateToDatabaseList}
        onEntityChange={handleEntityChange}
      />

      {!permissionEditor && (
        <PermissionsEditorEmptyState
          icon="database"
          message={t`Select a database to see group permissions`}
        />
      )}

      {permissionEditor && (
        <PermissionsEditor
          {...permissionEditor}
          onBreadcrumbsItemSelect={handleBreadcrumbsItemSelect}
          onChange={handlePermissionChange}
          onAction={handleAction}
        />
      )}

      {children}
    </Fragment>
  );
}

DatabasesPermissionsPage.propTypes = propTypes;

export default _.compose(connect(mapStateToProps, mapDispatchToProps))(
  DatabasesPermissionsPage,
);
