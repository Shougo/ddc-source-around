import type { DdcOptions, Item, SourceOptions } from "@shougo/ddc-vim/types";
import { BaseSource } from "@shougo/ddc-vim/source";
import { convertKeywordPattern } from "@shougo/ddc-vim/utils";

import type { Denops } from "@denops/std";
import * as fn from "@denops/std/function";

import { assertEquals } from "@std/assert/equals";

const COLUMNS_MAX = 200;

function allWords(
  lines: string[],
  pattern: string,
  minLength: number,
): string[] {
  const words = lines
    .filter((line) => line.length < COLUMNS_MAX)
    .flatMap((line) => [...line.matchAll(new RegExp(pattern, "gu"))])
    .filter((match) => match[0].length >= minLength)
    .map((match) => match[0]);
  return Array.from(new Set(words)); // Remove duplication
}

type Params = {
  maxSize: number;
  minLength: number;
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
      p.minLength,
    ).map((word) => ({ word }));
    return cs;
  }

  override params(): Params {
    return {
      maxSize: 200,
      minLength: 2,
    };
  }
}

Deno.test("allWords", () => {
  assertEquals(allWords([], "\\w*", 1), []);
  assertEquals(allWords(["_w2er"], "[a-zA-Z0-9_]+", 1), ["_w2er"]);
  assertEquals(allWords(["asdf _w2er", "223r wawer"], "[a-zA-Z0-9_]+", 1), [
    "asdf",
    "_w2er",
    "223r",
    "wawer",
  ]);
});
