import styled from "@emotion/styled";

import { Icon } from "metabase/core/components/Icon";
import { color } from "metabase/lib/colors";
import { space } from "metabase/styled-components/theme";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Anchor = styled.a`
  display: flex;
  padding: ${space(2)};

  &:hover {
    background-color: ${color("bg-medium")};
  }
`;

export const IconStyled = styled(Icon)`
  margin-right: ${space(1)};
`;
