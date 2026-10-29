import { readFileSync } from "node:fs";

function combineFragments(fragments: string[]): string {
  return fragments.reduce((acc, fragment) => {
    if (acc === "") {
      return fragment;
    }
    return acc + fragment.slice(2);
  }, "");
}

function readFragments(filePath: string): string[] {
  const fileContent = readFileSync(filePath, "utf8");

  return fileContent.split(/\s+/).filter((fragment) => fragment.length > 0);
}

function validateFragments(fragments: string[]): void {
  if (fragments.length === 0) {
    throw new Error("The input file contains no fragments.");
  }

  for (let index = 0; index < fragments.length; index++) {
    const fragment = fragments[index];

    if (!/^\d+$/.test(fragment)) {
      throw new Error(
        `Fragment ${index + 1} contains non-digit characters: "${fragment}"`,
      );
    }

    if (fragment.length < 2) {
      throw new Error(
        `Fragment ${index + 1} must contain at least two digits.`,
      );
    }
  }
}

function solve(fragments: string[]): string {
  const currentPath: number[] = [];
  let bestPath: number[] = [];
  let bestCombinedLength = 0;

  const visitedStates = Array.from({ length: 100 }, () => new Set<bigint>());
  const maxVisitedStates = 500_000;
  let visitedStateCount = 0;

  const fragmentEnds: number[] = new Array(fragments.length);
  const fragmentBits = fragments.map((_, index) => 1n << BigInt(index));
  const fragmentsByStart: number[][] = Array.from({ length: 100 }, () => []);
  const fragmentAdditionalLengths = fragments.map(
    (fragment) => fragment.length - 2,
  );

  for (
    let fragmentIndex = 0;
    fragmentIndex < fragments.length;
    fragmentIndex++
  ) {
    const fragment = fragments[fragmentIndex];
    const start = Number(fragment.slice(0, 2));
    const end = Number(fragment.slice(-2));

    fragmentEnds[fragmentIndex] = end;
    fragmentsByStart[start].push(fragmentIndex);
  }

  const visitedEnds = new Array<boolean>(100).fill(false);
  const endsToVisit: number[] = [];
  const outgoingCounts = new Array<number>(100).fill(0);
  const incomingCounts = new Array<number>(100).fill(0);

  function calculateMaximumAdditionalLength(
    currentEnd: number,
    usedMask: bigint,
  ): number {
    visitedEnds.fill(false);
    endsToVisit.length = 0;
    outgoingCounts.fill(0);
    incomingCounts.fill(0);
    endsToVisit.push(currentEnd);

    let reachableAdditionalLength = 0;
    let smallestAdditionalLength = Infinity;

    while (endsToVisit.length > 0) {
      const end = endsToVisit.pop();

      if (end === undefined) {
        break;
      }

      if (visitedEnds[end]) {
        continue;
      }

      visitedEnds[end] = true;

      for (const fragmentIndex of fragmentsByStart[end]) {
        const fragmentBit = fragmentBits[fragmentIndex];

        if ((usedMask & fragmentBit) !== 0n) {
          continue;
        }

        const additionalLength = fragmentAdditionalLengths[fragmentIndex];

        reachableAdditionalLength =
          reachableAdditionalLength + additionalLength;

        smallestAdditionalLength = Math.min(
          smallestAdditionalLength,
          additionalLength,
        );

        const nextEnd = fragmentEnds[fragmentIndex];

        outgoingCounts[end] = outgoingCounts[end] + 1;
        incomingCounts[nextEnd] = incomingCounts[nextEnd] + 1;

        if (!visitedEnds[nextEnd]) {
          endsToVisit.push(nextEnd);
        }
      }
    }

    let positiveExcess = 0;
    let negativeExcess = 0;

    for (let end = 0; end < 100; end++) {
      const difference = outgoingCounts[end] - incomingCounts[end];

      const allowedPositive = end === currentEnd ? 1 : 0;

      if (difference > allowedPositive) {
        positiveExcess += difference - allowedPositive;
      }

      if (difference < 0) {
        negativeExcess += -difference;
      }
    }

    const requiredRemovals = Math.max(
      positiveExcess,
      Math.max(0, negativeExcess - 1),
    );

    if (smallestAdditionalLength === Infinity) {
      return 0;
    }

    const minimumRemovedLength = requiredRemovals * smallestAdditionalLength;

    return Math.max(0, reachableAdditionalLength - minimumRemovedLength);
  }

  function search(
    currentEnd: number,
    usedMask: bigint,
    currentCombinedLength: number,
  ): void {
    if (currentCombinedLength > bestCombinedLength) {
      bestCombinedLength = currentCombinedLength;
      bestPath = [...currentPath];
    }

    const maximumPossibleLength =
      currentCombinedLength +
      calculateMaximumAdditionalLength(currentEnd, usedMask);

    if (maximumPossibleLength <= bestCombinedLength) {
      return;
    }

    const statesAtCurrentEnd = visitedStates[currentEnd];

    if (statesAtCurrentEnd.has(usedMask)) {
      return;
    }

    if (visitedStateCount < maxVisitedStates) {
      statesAtCurrentEnd.add(usedMask);
      visitedStateCount++;
    }

    for (const nextIndex of fragmentsByStart[currentEnd]) {
      const nextBit = fragmentBits[nextIndex];

      if ((usedMask & nextBit) !== 0n) {
        continue;
      }

      currentPath.push(nextIndex);
      search(
        fragmentEnds[nextIndex],
        usedMask | nextBit,
        currentCombinedLength + fragmentAdditionalLengths[nextIndex],
      );
      currentPath.pop();
    }
  }

  for (let startIndex = 0; startIndex < fragments.length; startIndex++) {
    currentPath.push(startIndex);
    search(
      fragmentEnds[startIndex],
      fragmentBits[startIndex],
      fragments[startIndex].length,
    );
    currentPath.pop();
  }

  return combineFragments(bestPath.map((index) => fragments[index]));
}

const filePath = process.argv[2];

if (!filePath) {
  throw new Error("Usage: node index.ts <path-to-source.txt>");
}

const fragments = readFragments(filePath);

validateFragments(fragments);

const result = solve(fragments);
console.log(result);
