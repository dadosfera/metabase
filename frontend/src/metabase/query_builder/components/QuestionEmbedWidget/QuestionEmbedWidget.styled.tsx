import styled from "@emotion/styled";

import { Icon } from "metabase/core/components/Icon";
import { color } from "metabase/lib/colors";
import { breakpointMinSmall } from "metabase/styled-components/theme";

export const TriggerIcon = styled(Icon)`
  display: none;
  margin: 0 0.5rem;
  cursor: pointer;

  &:hover {
    color: ${color("brand")};
  }

  ${breakpointMinSmall} {
    display: inherit;
  }
`;
