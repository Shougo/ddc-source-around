import {
  BaseSource,
  type DdcOptions,
  type Item,
  type SourceOptions,
} from "jsr:@shougo/ddc-vim@6.0.0/types";
import { convertKeywordPattern } from "jsr:@shougo/ddc-vim@6.0.0/utils";

import type { Denops } from "jsr:@denops/core@^7.0.0";
import * as fn from "jsr:@denops/std@7.0.1/function";

import { assertEquals } from "jsr:@std/assert@1.0.1";

const COLUMNS_MAX = 200;

function allWords(lines: string[], pattern: string): string[] {
  const words = lines
    .filter((line) => line.length < COLUMNS_MAX)
    .flatMap((line) => [...line.matchAll(new RegExp(pattern, "gu"))])
    .filter((match) => match[0].length > 0)
    .map((match) => match[0]);
  return Array.from(new Set(words)); // Remove duplication
}

type Params = {
  maxSize: number;
};

export class Source extends BaseSource<Params> {
  override async gather(args: {
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

    // Convert keywordPattern
    const keywordPattern = await convertKeywordPattern(
      args.denops,
      args.sourceOptions.keywordPattern,
    );

    const cs: Item[] = allWords(
      await fn.getline(args.denops, minLines, maxLines),
      keywordPattern,
    ).map((word) => ({ word }));
    return cs;
  }

  override params(): Params {
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
