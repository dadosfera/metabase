import type { LocationDescriptor } from "history";
import { useCallback } from "react";
import { connect } from "react-redux";
import { push } from "react-router-redux";
import { t } from "ttag";
import { mixpanel } from "metabase/plugins/mixpanel";

import ModalContent from "metabase/components/ModalContent";
import { CreateCollectionOnTheGo } from "metabase/containers/CreateCollectionOnTheGo";
import * as Urls from "metabase/lib/urls";

import type { Dashboard } from "metabase-types/api";
import type { State } from "metabase-types/store";

import type { CreateDashboardFormOwnProps } from "./CreateDashboardForm";
import { CreateDashboardFormConnected } from "./CreateDashboardForm";

interface CreateDashboardModalOwnProps
  extends Omit<CreateDashboardFormOwnProps, "onCancel"> {
  onClose?: () => void;
}

interface CreateDashboardModalDispatchProps {
  onChangeLocation: (location: LocationDescriptor) => void;
}

type Props = CreateDashboardModalOwnProps & CreateDashboardModalDispatchProps;

const mapDispatchToProps = {
  onChangeLocation: push,
};

function CreateDashboardModal({
  onCreate,
  onChangeLocation,
  onClose,
  ...props
}: Props) {
  const handleCreate = useCallback(
    (dashboard: Dashboard) => {
      mixpanel.trackEvent(mixpanel.events.create_dashboard);
      if (typeof onCreate === "function") {
        onCreate(dashboard);
      } else {
        onClose?.();
        onChangeLocation(Urls.dashboard(dashboard, { editMode: true }));
      }
    },
    [onCreate, onChangeLocation, onClose],
  );

  return (
    <CreateCollectionOnTheGo>
      {({ resumedValues }) => (
        <ModalContent title={t`New dashboard`} onClose={onClose}>
          <CreateDashboardFormConnected
            {...props}
            onCreate={handleCreate}
            onCancel={onClose}
            initialValues={resumedValues}
          />
        </ModalContent>
      )}
    </CreateCollectionOnTheGo>
  );
}

export const CreateDashboardModalConnected = connect<
  unknown,
  CreateDashboardModalDispatchProps,
  CreateDashboardModalOwnProps,
  State
>(
  null,
  mapDispatchToProps,
)(CreateDashboardModal);
