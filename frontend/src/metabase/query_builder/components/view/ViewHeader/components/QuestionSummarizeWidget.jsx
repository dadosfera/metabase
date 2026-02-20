/* eslint-disable react/prop-types */
import cx from "classnames";
import { t } from "ttag";

import { useRegisterShortcut } from "metabase/palette/hooks/useRegisterShortcut";
import { mixpanel } from "metabase/plugins/mixpanel";
import { Button, Icon } from "metabase/ui";
import * as Lib from "metabase-lib";

import ViewTitleHeaderS from "../ViewTitleHeader.module.css";

export function QuestionSummarizeWidget({
  isShowingSummarySidebar,
  onEditSummary,
  onCloseSummary,
  className,
}) {
  const handleClick = () => {
    if (isShowingSummarySidebar) {
      onCloseSummary();
    } else {
      onEditSummary();
    }
  };

  useRegisterShortcut(
    [
      {
        id: "query-builder-toggle-summarize-sidebar",
        perform: handleClick,
      },
    ],
    [isShowingSummarySidebar],
  );

  return (
    <Button
      color="summarize"
      variant={isShowingSummarySidebar ? "filled" : "default"}
      leftSection={<Icon name="sum" />}
      onClick={async () => {
        if (isShowingSummarySidebar) {
          mixpanel.trackEvent(mixpanel.events.summarize.close);
          onCloseSummary();
        } else {
          mixpanel.trackEvent(mixpanel.events.summarize.open);
          onEditSummary();
        }
      }}
      data-active={isShowingSummarySidebar}
      className={cx(className, ViewTitleHeaderS.SummarizeButton)}
    >
      {t`Summarize`}
    </Button>
  );
}

QuestionSummarizeWidget.shouldRender = ({
  question,
  queryBuilderMode,
  isObjectDetail,
  isActionListVisible,
}) => {
  const { isEditable, isNative } = Lib.queryDisplayInfo(question.query());
  return (
    queryBuilderMode === "view" &&
    question &&
    !isNative &&
    isEditable &&
    !isObjectDetail &&
    isActionListVisible &&
    !question.isArchived()
  );
};
