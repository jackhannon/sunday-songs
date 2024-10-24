import {expect, test} from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { describe, it } from "node:test";


describe("Tables", () => {
  it("renders tables", () => {
    render(<Home />);
    expect(screen.getByText("Songs")).toBeInTheDocument();  
  })
})


