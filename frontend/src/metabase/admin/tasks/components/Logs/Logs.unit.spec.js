import { render, screen } from "@testing-library/react";
import fetchMock from "fetch-mock";

import { UtilApi } from "metabase/services";

import { Logs } from "./Logs";

describe("Logs", () => {
  describe("log fetching", () => {
    it("should call UtilApi.logs after 1 second", () => {
      jest.useFakeTimers();
      fetchMock.get("path:/api/util/logs", []);
      render(<Logs />);
      const utilSpy = jest.spyOn(UtilApi, "logs");

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      jest.advanceTimersByTime(1001);
      expect(utilSpy).toHaveBeenCalled();
    });
  });
});
