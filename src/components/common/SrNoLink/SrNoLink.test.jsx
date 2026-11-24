import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SrNoLink from "./SrNoLink";

describe("SrNoLink", () => {
    it("shows the serial number as an accessible, clickable button", () => {
        const onClick = vi.fn();
        render(<SrNoLink value={11} onClick={onClick} />);

        const btn = screen.getByRole("button", { name: /open record — sr\. no\. 11/i });
        expect(btn.textContent).toContain("11");
        expect(btn.getAttribute("title")).toBe("Open record");

        fireEvent.click(btn);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not render the database id — only the value it is given", () => {
        render(<SrNoLink value={3} onClick={() => {}} />);
        expect(screen.getByRole("button").textContent.trim()).toBe("3");
    });
});
