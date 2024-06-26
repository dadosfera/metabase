/* eslint "react/prop-types": "warn" */
import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";

import SidebarLayout from "metabase/components/SidebarLayout";
import * as metadataActions from "metabase/redux/metadata";
import TableList from "metabase/reference/databases/TableList";
import * as actions from "metabase/reference/reference";

import { getDatabase, getDatabaseId, getIsEditing } from "../selectors";

import DatabaseSidebar from "./DatabaseSidebar";

const mapStateToProps = (state, props) => ({
  database: getDatabase(state, props),
  databaseId: getDatabaseId(state, props),
  isEditing: getIsEditing(state, props),
});

const mapDispatchToProps = {
  ...metadataActions,
  ...actions,
};

class TableListContainer extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    database: PropTypes.object.isRequired,
    databaseId: PropTypes.number.isRequired,
    isEditing: PropTypes.bool,
  };

  async fetchContainerData() {
    await actions.wrappedFetchDatabaseMetadata(
      this.props,
      this.props.databaseId,
    );
  }

  UNSAFE_componentWillMount() {
    this.fetchContainerData();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.props.location.pathname === newProps.location.pathname) {
      return;
    }

    actions.clearState(newProps);
  }

  render() {
    const { database, isEditing } = this.props;

    return (
      <SidebarLayout
        className="flex-full relative"
        style={isEditing ? { paddingTop: "43px" } : {}}
        sidebar={<DatabaseSidebar database={database} />}
      >
        <TableList {...this.props} />
      </SidebarLayout>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableListContainer);
