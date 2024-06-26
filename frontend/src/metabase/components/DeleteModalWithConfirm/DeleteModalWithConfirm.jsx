import cx from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import { t } from "ttag";
import _ from "underscore";

import ModalContent from "metabase/components/ModalContent";
import CheckBox from "metabase/core/components/CheckBox";

import { CheckboxLabel } from "./DeleteModalWithConfirm.styled";

export default class DeleteModalWithConfirm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checked: {},
    };

    _.bindAll(this, "onDelete");
  }

  static propTypes = {
    title: PropTypes.string.isRequired,
    objectType: PropTypes.string.isRequired,
    confirmItems: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    buttonText: PropTypes.string,
  };

  async onDelete() {
    await this.props.onDelete();
    this.props.onClose();
  }

  render() {
    const { title, objectType, confirmItems, buttonText } = this.props;
    const { checked } = this.state;
    const confirmed = confirmItems.reduce(
      (acc, item, index) => acc && checked[index],
      true,
    );
    return (
      <ModalContent title={title} onClose={this.props.onClose}>
        <div>
          <ul>
            {confirmItems.map((item, index) => (
              <li
                key={index}
                className="pb2 mb2 border-row-divider flex align-center"
              >
                <CheckBox
                  label={<CheckboxLabel>{item}</CheckboxLabel>}
                  size={20}
                  checkedColor="danger"
                  uncheckedColor="danger"
                  checked={checked[index]}
                  onChange={e =>
                    this.setState({
                      checked: { ...checked, [index]: e.target.checked },
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="Form-actions ml-auto">
          <button
            className="Button"
            onClick={this.props.onClose}
          >{t`Cancel`}</button>
          <button
            className={cx("Button ml2", {
              disabled: !confirmed,
              "Button--danger": confirmed,
            })}
            onClick={this.onDelete}
          >
            {buttonText || t`Delete this ${objectType}`}
          </button>
        </div>
      </ModalContent>
    );
  }
}
