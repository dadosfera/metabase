/* eslint-disable react/prop-types */
import { Icon } from "metabase/core/components/Icon";
import Tooltip from "metabase/core/components/Tooltip";

const Warnings = ({ warnings, className = "", size = 16 }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }
  const tooltip = (
    <ul className="px2 pt2 pb1" style={{ maxWidth: 350 }}>
      {warnings.map(warning => (
        <li className="pb1" key={warning}>
          {warning}
        </li>
      ))}
    </ul>
  );

  return (
    <Tooltip tooltip={tooltip}>
      <Icon className={className} name="warning" size={size} />
    </Tooltip>
  );
};

export default Warnings;
