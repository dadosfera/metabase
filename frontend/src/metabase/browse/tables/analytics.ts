import { trackSchemaEvent, trackSimpleEvent } from "metabase/lib/analytics";
import { mixpanel } from "metabase/plugins/mixpanel";
import type { ConcreteTableId } from "metabase-types/api";

export const trackTableClick = (tableId: ConcreteTableId) =>
  trackSchemaEvent("browse_data", {
    event: "browse_data_table_clicked",
    table_id: tableId,
  });

export const trackBrowseXRayClicked = () => {
  mixpanel.trackEvent(mixpanel.events.xray);

  trackSimpleEvent({
    event: "x-ray_clicked",
    event_detail: "table",
    triggered_from: "browse_database",
  });
};
