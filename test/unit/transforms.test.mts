import {
  BoldTransform,
  ItalicTransform,
  UnderlinedTransform,
  StrikethroughTransform,
  BlockQuoteTransform,
  CodeTransform,
  PreformattedTransform,
  QuotationMarksTransform,
  GuillemetsTransform,
  UppercaseTransform,
  LowercaseTransform,
  CapitalizeTransform,
  PrefixTransform,
  SuffixTransform,
  ReplaceTransform,
  AudioSnippetTransform,
  MapTransform,
  StripUtmParamsTransform,
} from "../../src/utils/transforms.mjs";

describe("Transforms", () => {
  it("BoldTransform wraps with <strong>", () => {
    expect(new BoldTransform().apply("text")).toEqual("<strong>text</strong>");
  });

  it("ItalicTransform wraps with <em>", () => {
    expect(new ItalicTransform().apply("text")).toEqual("<em>text</em>");
  });

  it("UnderlinedTransform wraps with <u>", () => {
    expect(new UnderlinedTransform().apply("text")).toEqual("<u>text</u>");
  });

  it("StrikethroughTransform wraps with <del>", () => {
    expect(new StrikethroughTransform().apply("text")).toEqual("<del>text</del>");
  });

  it("BlockQuoteTransform wraps with <blockquote>", () => {
    expect(new BlockQuoteTransform().apply("quote")).toEqual("<blockquote>quote</blockquote>");
  });

  it("CodeTransform wraps with <code>", () => {
    expect(new CodeTransform().apply("code")).toEqual("<code>code</code>");
  });

  it("PreformattedTransform wraps with <pre>", () => {
    expect(new PreformattedTransform().apply("pre")).toEqual("<pre>pre</pre>");
  });

  it("QuotationMarksTransform surrounds with curly quotes", () => {
    expect(new QuotationMarksTransform().apply("hello")).toEqual("“hello”");
  });

  it("GuillemetsTransform surrounds with guillemets and narrow spaces", () => {
    // The transform produces: « value » (with narrow no-break spaces)
    expect(new GuillemetsTransform().apply("val")).toEqual("« val »");
  });

  it("UppercaseTransform converts to upper case", () => {
    expect(new UppercaseTransform().apply("Abc")).toEqual("ABC");
  });

  it("LowercaseTransform converts to lower case", () => {
    expect(new LowercaseTransform().apply("AbC")).toEqual("abc");
  });

  it("CapitalizeTransform title-cases each word", () => {
    expect(new CapitalizeTransform().apply("hello WORLD")).toEqual("Hello World");
  });

  it("PrefixTransform adds a prefix", () => {
    expect(new PrefixTransform("pre-").apply("value")).toEqual("pre-value");
  });

  it("SuffixTransform adds a suffix", () => {
    expect(new SuffixTransform("-suf").apply("value")).toEqual("value-suf");
  });

  it("ReplaceTransform replaces only the first occurrence when using a string search", () => {
    const r = new ReplaceTransform("foo", "bar");
    expect(r.apply("foo and foo")).toEqual("bar and foo");
  });

  it("ReplaceTransform replaces all occurrences when using a global regex", () => {
    const r = new ReplaceTransform(/foo/g, "bar");
    expect(r.apply("foo and foo")).toEqual("bar and bar");
  });

  it("ReplaceTransform supports regex capture groups in replacement", () => {
    const r = new ReplaceTransform(/(\d+)-(\d+)/, "$2/$1");
    expect(r.apply("2023-12")).toEqual("12/2023");
  });

  it("AudioSnippetTransform formats seconds into minutes and seconds", () => {
    const t = new AudioSnippetTransform("Audio");
    expect(t.apply("125")).toEqual("Audio (2 min 05 sec)");
  });

  it("AudioSnippetTransform returns empty string for invalid duration", () => {
    const t = new AudioSnippetTransform("Audio");
    expect(t.apply("not-a-number")).toEqual("");
  });

  it("MapTransform returns mapped value in strict mode and throws when missing", () => {
    const map = { a: "A", b: "B" };
    const strict = new MapTransform(map);
    expect(strict.apply("a")).toEqual("A");
    expect(() => strict.apply("c")).toThrow();
  });

  it("MapTransform returns original value in non-strict mode when missing", () => {
    const map = { a: "A" };
    const nonStrict = new MapTransform(map, false);
    expect(nonStrict.apply("c")).toEqual("c");
  });

  it("StripUtmParamsTransform removes utm_* query parameters and keeps other params", () => {
    const input = "https://example.com/path?utm_source=google&utm_medium=cpc&q=search&utm_campaign=summer";
    const out = new StripUtmParamsTransform().apply(input);
    expect(out).toEqual("https://example.com/path?q=search");
  });

  it("StripUtmParamsTransform returns the same URL when there are no utm_ parameters", () => {
    const input = "https://example.com/path?q=search";
    const out = new StripUtmParamsTransform().apply(input);
    expect(out).toEqual("https://example.com/path?q=search");
  });

  it("StripUtmParamsTransform removes only-utm query parameters leaving a clean origin/path", () => {
    const input = "https://example.com/?utm_source=foo";
    const out = new StripUtmParamsTransform().apply(input);
    expect(out).toEqual("https://example.com/");
  });

  it("StripUtmParamsTransform returns the original value for non-URL strings", () => {
    const input = "not-a-url";
    const out = new StripUtmParamsTransform().apply(input);
    expect(out).toEqual(input);
  });
});
