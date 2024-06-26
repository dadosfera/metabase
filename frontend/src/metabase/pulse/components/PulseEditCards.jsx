import PropTypes from "prop-types";
import { Component } from "react";
import { t } from "ttag";

import QuestionSelect from "metabase/containers/QuestionSelect";
import * as MetabaseAnalytics from "metabase/lib/analytics";
import { color } from "metabase/lib/colors";

import PulseCardPreview from "./PulseCardPreview";
import { AttachmentType, CardNotice } from "./PulseEditCards.styled";

const SOFT_LIMIT = 10;
const HARD_LIMIT = 25;
const TABLE_MAX_ROWS = 20;
const TABLE_MAX_COLS = 10;

function isAutoAttached(cardPreview) {
  return (
    cardPreview &&
    cardPreview.pulse_card_type === "table" &&
    (cardPreview.row_count > TABLE_MAX_ROWS ||
      cardPreview.col_count > TABLE_MAX_COLS)
  );
}

export default class PulseEditCards extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static propTypes = {
    pulse: PropTypes.object.isRequired,
    pulseId: PropTypes.number,
    cardPreviews: PropTypes.object.isRequired,
    fetchPulseCardPreview: PropTypes.func.isRequired,
    setPulse: PropTypes.func.isRequired,
    attachmentsEnabled: PropTypes.bool,
  };
  static defaultProps = {};

  setCard(index, card) {
    const { pulse } = this.props;
    this.props.setPulse({
      ...pulse,
      cards: [
        ...pulse.cards.slice(0, index),
        card,
        ...pulse.cards.slice(index + 1),
      ],
    });
  }

  trackPulseEvent = (eventName, eventValue) => {
    MetabaseAnalytics.trackStructEvent(
      this.props.pulseId ? "PulseEdit" : "PulseCreate",
      eventName,
      eventValue,
    );
  };

  addCard(index, cardId) {
    this.setCard(index, { id: cardId, include_csv: false, include_xls: false });
    this.trackPulseEvent("AddCard", index);
  }

  removeCard(index) {
    const { pulse } = this.props;
    this.props.setPulse({
      ...pulse,
      cards: [...pulse.cards.slice(0, index), ...pulse.cards.slice(index + 1)],
    });

    this.trackPulseEvent("RemoveCard", index);
  }

  maybeRenderAttachmentNotice(card, cardPreview, index) {
    const hasAttachment =
      isAutoAttached(cardPreview) ||
      (this.props.attachmentsEnabled &&
        card &&
        (card.include_csv || card.include_xls));

    if (!hasAttachment) {
      return null;
    }

    return (
      <CardNotice>
        <h3 className="mb1">{t`Attachment`}</h3>
        <div className="h4">
          <AttachmentWidget
            card={card}
            onChange={card => this.setCard(index, card)}
            trackPulseEvent={this.trackPulseEvent}
          />
        </div>
      </CardNotice>
    );
  }

  render() {
    const { pulse, cardPreviews } = this.props;

    const pulseCards = pulse ? pulse.cards.slice() : [];
    if (pulseCards.length < HARD_LIMIT) {
      pulseCards.push(null);
    }

    return (
      <div className="py1">
        <h2>{t`Pick your data`}</h2>
        <p className="mt1 h4 text-bold text-medium">
          {t`Choose questions you'd like to send in this pulse`}.
        </p>
        <ol className="my3">
          {pulseCards.map((card, index) => (
            <li key={index} className="my1">
              {index === SOFT_LIMIT && (
                <div
                  className="my4 ml3"
                  style={{
                    width: 375,
                    borderTop: `1px dashed ${color("border")}`,
                  }}
                />
              )}
              <div className="flex align-top">
                <div className="flex align-top" style={{ width: 400 }}>
                  <span className="h3 text-bold mr1 mt2">{index + 1}.</span>
                  {card ? (
                    <PulseCardPreview
                      card={card}
                      cardPreview={cardPreviews[card.id]}
                      onChange={this.setCard.bind(this, index)}
                      onRemove={this.removeCard.bind(this, index)}
                      fetchPulseCardPreview={this.props.fetchPulseCardPreview}
                      attachmentsEnabled={
                        this.props.attachmentsEnabled &&
                        !isAutoAttached(cardPreviews[card.id])
                      }
                      trackPulseEvent={this.trackPulseEvent}
                    />
                  ) : (
                    <QuestionSelect
                      onChange={questionId => this.addCard(index, questionId)}
                      className="flex-full"
                      // TODO: reimplement CardPicker's warnings for unsuitable cards
                      // attachmentsEnabled={this.props.attachmentsEnabled}
                    />
                  )}
                </div>
                {this.maybeRenderAttachmentNotice(
                  card,
                  card && this.props.cardPreviews[card.id],
                  index,
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

const ATTACHMENT_TYPES = ["csv", "xls"];

const AttachmentWidget = ({ card, onChange, trackPulseEvent }) => (
  <div>
    {ATTACHMENT_TYPES.map(type => (
      <AttachmentType
        key={type}
        isSelected={card["include_" + type]}
        onClick={() => {
          const newCard = { ...card };
          for (const attachmentType of ATTACHMENT_TYPES) {
            newCard["include_" + attachmentType] = type === attachmentType;
          }

          trackPulseEvent("AttachmentTypeChanged", type);
          onChange(newCard);
        }}
      >
        {"." + type}
      </AttachmentType>
    ))}
  </div>
);

AttachmentWidget.propTypes = {
  card: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  trackPulseEvent: PropTypes.func.isRequired,
};
