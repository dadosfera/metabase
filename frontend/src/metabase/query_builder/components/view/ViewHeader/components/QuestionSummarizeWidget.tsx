import { t } from "ttag";

import { useRegisterShortcut } from "metabase/palette/hooks/useRegisterShortcut";
import type { QueryBuilderMode } from "metabase/redux/store";
import { mixpanel } from "metabase/plugins/mixpanel";
import { Button, Icon } from "metabase/ui";
import * as Lib from "metabase-lib";
import type Question from "metabase-lib/v1/Question";

import ViewTitleHeaderS from "../ViewTitleHeader.module.css";

interface QuestionSummarizeWidgetProps {
  isShowingSummarySidebar: boolean;
  editSummary: () => void;
  onCloseSummary: () => void;
}

export function QuestionSummarizeWidget({
  isShowingSummarySidebar,
  editSummary,
  onCloseSummary,
}: QuestionSummarizeWidgetProps) {
  const handleClick = () => {
    if (isShowingSummarySidebar) {
      onCloseSummary();
    } else {
      editSummary();
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
      className={ViewTitleHeaderS.SummarizeButton}
      classNames={{
        root: ViewTitleHeaderS.ActionButtonRoot,
        label: ViewTitleHeaderS.ActionButtonLabel,
        section: ViewTitleHeaderS.ActionButtonSection,
      }}
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
}: {
  question: Question;
  queryBuilderMode: QueryBuilderMode;
  isObjectDetail: boolean;
  isActionListVisible: boolean;
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
