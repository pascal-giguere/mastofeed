import itemJson from "./rss-item.json" with { type: "json" };
import { Item } from "rss-parser";
import { PropertyDef } from "../../src/utils/properties.mjs";

const item = itemJson as unknown as Item;

describe("RSS item value extraction", () => {
  it("extracts a value with a basic path", () => {
    expect(new PropertyDef({ path: "title" }).extractValue(item)).toEqual(
      "La Presse à la 73e Berlinale | Bono à Berlin, et à Sarajevo",
    );
  });

  it("extracts a value with a nested path", () => {
    expect(new PropertyDef({ path: "enclosure.length" }).extractValue(item)).toEqual("214226");
  });

  it("extracts a value using regex pattern matching", () => {
    expect(new PropertyDef({ path: "title", regex: "^(.+) \\|" }).extractValue(item)).toEqual(
      "La Presse à la 73e Berlinale",
    );

    expect(new PropertyDef({ path: "title", regex: "\\| (.+)?" }).extractValue(item)).toEqual(
      "Bono à Berlin, et à Sarajevo",
    );

    expect(
      new PropertyDef({ path: "link", regex: "^https:\\/\\/www\\.lapresse\\.ca\\/(\\w+)\\/" }).extractValue(item),
    ).toEqual("cinema");
  });
});
