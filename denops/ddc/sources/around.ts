import {
  BaseSource,
  Candidate,
  Context,
  DdcOptions,
  SourceOptions,
} from "https://deno.land/x/ddc_vim@v0.0.11/types.ts#^";
import {
  assertEquals,
  batch,
  Denops,
  fn,
} from "https://deno.land/x/ddc_vim@v0.0.11/deps.ts#^";

function allWords(lines: string[]): string[] {
  return lines.flatMap((line) => [...line.matchAll(/[a-zA-Z0-9_]+/g)])
    .map((match) => match[0]).filter((e, i, self) => self.indexOf(e) === i);
}

type Params = {
  maxSize: number;
};

export class Source extends BaseSource {
  async gatherCandidates(
    denops: Denops,
    _context: Context,
    _ddcOptions: DdcOptions,
    _sourceOptions: SourceOptions,
    sourceParams: Record<string, unknown>,
    completeStr: string,
  ): Promise<Candidate[]> {
    const p = sourceParams as unknown as Params;
    const maxSize = p.maxSize;
    const currentLine = await fn.line(denops, ".");
    const minLines = Math.max(1, currentLine - maxSize);
    const maxLines = Math.min(
      await fn.line(denops, "$"),
      currentLine + maxSize,
    );
    const cs: Candidate[] = allWords(
      await fn.getline(denops, minLines, maxLines),
    ).filter((word) => word != completeStr)
      .map((word) => ({ word }));
    return cs;
  }

  params(): Record<string, unknown> {
    const params: Params = {
      maxSize: 200,
    };
    return params as unknown as Record<string, unknown>;
  }
}

Deno.test("pages", () => {
  assertEquals(Array.from(splitPages(1, 600, 500)), [[1, 500], [501, 1000]]);
  assertEquals(Array.from(splitPages(1, 1, 500)), [[1, 500]]);
  assertEquals(Array.from(splitPages(1, 500, 500)), [[1, 500]]);
  assertEquals(Array.from(splitPages(1, 501, 500)), [[1, 500], [501, 1000]]);
});

Deno.test("allWords", () => {
  assertEquals(allWords([]), []);
  assertEquals(allWords(["_w2er"]), ["_w2er"]);
  assertEquals(allWords(["asdf _w2er", "223r wawer"]), [
    "asdf",
    "_w2er",
    "223r",
    "wawer",
  ]);
});
