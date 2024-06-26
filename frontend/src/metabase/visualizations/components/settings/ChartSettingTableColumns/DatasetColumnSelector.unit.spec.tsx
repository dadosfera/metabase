import userEvent from "@testing-library/user-event";
import { assocIn } from "icepick";

import { screen, renderWithProviders } from "__support__/ui";
import type {
  DatasetColumn,
  TableColumnOrderSetting,
} from "metabase-types/api";
import {
  createMockColumn,
  createMockTableColumnOrderSetting,
} from "metabase-types/api/mocks";
import { ORDERS } from "metabase-types/api/mocks/presets";

import { DatasetColumnSelector } from "./DatasetColumnSelector";

const COLUMNS = [
  createMockColumn({
    id: ORDERS.ID,
    name: "ID",
    display_name: "ID",
    field_ref: ["field", ORDERS.ID, null],
  }),
  createMockColumn({
    id: ORDERS.TOTAL,
    name: "TOTAL",
    display_name: "Total",
    field_ref: ["field", ORDERS.TOTAL, null],
  }),
  createMockColumn({
    id: ORDERS.TAX,
    name: "TAX",
    display_name: "Tax",
    field_ref: ["field", ORDERS.TAX, null],
  }),
  createMockColumn({
    id: ORDERS.SUBTOTAL,
    name: "SUBTOTAL",
    display_name: "Subtotal",
    field_ref: ["field", ORDERS.SUBTOTAL, null],
  }),
];

const COLUMN_SETTINGS = [
  createMockTableColumnOrderSetting({
    name: "TOTAL",
    fieldRef: ["field", ORDERS.TOTAL, null],
    enabled: true,
  }),
  createMockTableColumnOrderSetting({
    name: "ID",
    fieldRef: ["field", ORDERS.ID, null],
    enabled: true,
  }),
  createMockTableColumnOrderSetting({
    name: "TAX",
    fieldRef: ["field", ORDERS.TAX, null],
    enabled: false,
  }),
  createMockTableColumnOrderSetting({
    name: "SUBTOTAL",
    fieldRef: ["field", ORDERS.SUBTOTAL, null],
    enabled: false,
  }),
];

interface SetupOpts {
  value?: TableColumnOrderSetting[];
  columns?: DatasetColumn[];
  getColumnName?: (column: DatasetColumn) => string;
}

const setup = ({
  value = COLUMN_SETTINGS,
  columns = COLUMNS,
  getColumnName = column => column.display_name,
}: SetupOpts = {}) => {
  const onChange = jest.fn();
  const onShowWidget = jest.fn();

  renderWithProviders(
    <DatasetColumnSelector
      value={value}
      columns={columns}
      getColumnName={getColumnName}
      onChange={onChange}
      onShowWidget={onShowWidget}
    />,
  );

  return { onChange };
};

describe("DatasetColumnSelector", () => {
  it("should display columns in the order of the setting", () => {
    setup();
    const items = screen.getAllByTestId(/draggable-item/);
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Total");
    expect(items[1]).toHaveTextContent("ID");
    expect(items[2]).toHaveTextContent("Tax");
    expect(items[3]).toHaveTextContent("Subtotal");
  });

  it("should allow to enable a column", () => {
    const columnIndex = findColumnIndex("TAX", COLUMN_SETTINGS);
    const { onChange } = setup();

    enableColumn("Tax");
    expect(onChange).toHaveBeenCalledWith(
      assocIn(COLUMN_SETTINGS, [columnIndex, "enabled"], true),
    );
  });

  it("should allow to disable a column", () => {
    const columnIndex = findColumnIndex("ID", COLUMN_SETTINGS);
    const { onChange } = setup();

    disableColumn("ID");
    expect(onChange).toHaveBeenCalledWith(
      assocIn(COLUMN_SETTINGS, [columnIndex, "enabled"], false),
    );
  });
});

const enableColumn = (columnName: string) => {
  userEvent.click(screen.getByTestId(`${columnName}-show-button`));
};

const disableColumn = (columnName: string) => {
  userEvent.click(screen.getByTestId(`${columnName}-hide-button`));
};

const findColumnIndex = (
  columnName: string,
  settings: TableColumnOrderSetting[],
) => {
  return settings.findIndex(setting => setting.name === columnName);
};
