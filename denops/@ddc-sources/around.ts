import {
  BaseSource,
  DdcOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v2.2.0/types.ts";
import {
  assertEquals,
  Denops,
  fn,
} from "https://deno.land/x/ddc_vim@v2.2.0/deps.ts";

function allWords(lines: string[], pattern: string): string[] {
  const words = lines
    .flatMap((line) => [...line.matchAll(new RegExp(pattern, "gu"))])
    .filter((match) => match[0].length > 0)
    .map((match) => match[0]);
  return Array.from(new Set(words)); // remove duplication
}

type Params = {
  maxSize: number;
};

export class Source extends BaseSource<Params> {
  async gather(args: {
    denops: Denops;
    options: DdcOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    completeStr: string;
  }): Promise<Item[]> {
    const p = args.sourceParams as unknown as Params;
    const maxSize = p.maxSize;
    const currentLine = await fn.line(args.denops, ".");
    const minLines = Math.max(1, currentLine - maxSize);
    const maxLines = Math.min(
      await fn.line(args.denops, "$"),
      currentLine + maxSize,
    );
    const cs: Item[] = allWords(
      await fn.getline(args.denops, minLines, maxLines),
      args.options.keywordPattern,
    ).map((word) => ({ word }));
    return cs;
  }

  params(): Params {
    return {
      maxSize: 200,
    };
  }
}

Deno.test("allWords", () => {
  assertEquals(allWords([], "\\w*"), []);
  assertEquals(allWords(["_w2er"], "[a-zA-Z0-9_]+"), ["_w2er"]);
  assertEquals(allWords(["asdf _w2er", "223r wawer"], "[a-zA-Z0-9_]+"), [
    "asdf",
    "_w2er",
    "223r",
    "wawer",
  ]);
});
