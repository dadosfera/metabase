import { trackSimpleEvent } from "metabase/analytics";
import { mixpanel } from "metabase/plugins/mixpanel";

export const trackReferenceXRayClicked = (
  source: "table" | "field" | "segment",
) => {
  mixpanel.trackEvent(mixpanel.events.xray);
  trackSimpleEvent({
    event: "x-ray_clicked",
    event_detail: source,
    triggered_from: "data_reference",
  });
};
