// eslint-disable-next-line no-restricted-imports
import { css } from "@emotion/react";
// eslint-disable-next-line no-restricted-imports
import styled from "@emotion/styled";


import { Link } from "metabase/common/components/Link";
import { doNotForwardProps } from "metabase/common/utils/doNotForwardProps";

export const LogoLink = styled(
  Link,
  doNotForwardProps("isSmallAppBar", "isGitSyncVisible"),
)<{
  isSmallAppBar: boolean;
  isGitSyncVisible: boolean;
}>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  height: 3.25rem;
  min-width: 2.25rem;
  max-width: 14rem;
  line-height: 0;
  opacity: 1;
  ${(props) =>
    !props.isSmallAppBar &&
    css`
      margin-inline-end: ${props.isGitSyncVisible ? "1rem" : "2rem"};
    `}
`;

// eslint-disable-next-line metabase/no-color-literals
export const DadosferaLogo = styled.div`
  --mb-color-text-primary-inverse: var(--mantine-color-white);
  
  color: var(--mb-color-text-primary-inverse);
  display: flex;
  height: 100%;
  align-items: center;
  border-left: 1px solid #eeecec;
  margin: 5px 10px;
  padding: 5px 10px;
  font-weight: bold;

  > span {
    margin-top: 3px;
  }

  > img {
    margin-left: 5px;
    width: 20px;
  }
`;
