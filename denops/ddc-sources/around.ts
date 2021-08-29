import {
  BaseSource,
  Candidate,
  DdcOptions,
} from "https://deno.land/x/ddc_vim@v0.3.0/types.ts#^";
import {
  assertEquals,
  Denops,
  fn,
} from "https://deno.land/x/ddc_vim@v0.3.0/deps.ts#^";

function allWords(lines: string[], pattern: string): string[] {
  const words = lines
    .flatMap((line) => [...line.matchAll(new RegExp(pattern, 'gu'))])
    .map((match) => match[0]);
  return Array.from(new Set(words)); // remove duplication
}

type Params = {
  maxSize: number;
};

export class Source extends BaseSource {
  async gatherCandidates(args: {
    denops: Denops,
    options: DdcOptions,
    sourceParams: Record<string, unknown>,
    completeStr: string,
  }): Promise<Candidate[]> {
    const p = args.sourceParams as unknown as Params;
    const maxSize = p.maxSize;
    const currentLine = await fn.line(args.denops, ".");
    const minLines = Math.max(1, currentLine - maxSize);
    const maxLines = Math.min(
      await fn.line(args.denops, "$"),
      currentLine + maxSize,
    );
    const cs: Candidate[] = allWords(
      await fn.getline(args.denops, minLines, maxLines),
      args.options.keywordPattern,
    ).map((word) => ({ word }));
    return cs;
  }

  params(): Record<string, unknown> {
    const params: Params = {
      maxSize: 200,
    };
    return params as unknown as Record<string, unknown>;
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