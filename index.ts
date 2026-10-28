const FRAGMENTS = [
  "942517",
  "605676",
  "498291",
  "668826",
  "357057",
  "478151",
  "315629",
  "007148",
  "252887",
  "421662",
  "284505",
  "467650",
  "115330",
  "648206",
  "207562",
  "612298",
  "576885",
  "294200",
  "847595",
  "021597",
  "074878",
  "801997",
  "585401",
  "168510",
  "385293",
  "151863",
  "022142",
  "340350",
  "976151",
  "337989",
  "863284",
  "488310",
  "303887",
  "939173",
  "331413",
  "905657",
  "833617",
  "170794",
  "094486",
  "551394",
  "943693",
  "147970",
  "400196",
  "537505",
  "367493",
  "117178",
  "675840",
  "868721",
  "519081",
  "735564",
  "401733",
  "915348",
  "169233",
  "324651",
  "958675",
  "368753",
  "861460",
  "401341",
  "343222",
  "794373",
  "816374",
  "535119",
  "188234",
  "577779",
  "097792",
  "729303",
  "782637",
  "148159",
  "830641",
  "716890",
  "397853",
  "871196",
  "277603",
  "749226",
  "839595",
  "131852",
  "409432",
  "810698",
  "456030",
  "529185",
  "758823",
  "265024",
  "051041",
  "699031",
  "737269",
  "139340",
  "730977",
  "249786",
  "039931",
  "055669",
  "100107",
  "653178",
  "279773",
  "336550",
  "332847",
  "685485",
  "423269",
  "193536",
  "890062",
  "377637",
  "595777",
  "412134",
  "322736",
  "546929",
  "616370",
  "767332",
  "781184",
  "920944",
  "851005",
  "258850",
  "064083",
  "051202",
  "427711",
  "359855",
  "540928",
  "314284",
  "085261",
  "880969",
  "649699",
  "064881",
  "705423",
  "646927",
  "252556",
  "272007",
  "217511",
  "620286",
  "229724",
  "108865",
  "124636",
  "231417",
  "961201",
  "658432",
  "775416",
  "246027",
  "854036",
  "687762",
  "389097",
  "013153",
  "417085",
  "919198",
  "988711",
  "488665",
];

function combineFragments(fragments: string[]): string {
  return fragments.reduce((acc, fragment) => {
    if (acc === "") {
      return fragment;
    }
    return acc + fragment.slice(2);
  }, "");
}

function solve(fragments: string[]): string {
  const currentPath: number[] = [];
  let bestPath: number[] = [];

  const visitedStates = Array.from({ length: 100 }, () => new Set<bigint>());
  const maxVisitedStates = 500_000;
  let visitedStateCount = 0;

  const fragmentEnds: number[] = new Array(fragments.length);
  const fragmentBits = fragments.map((_, index) => 1n << BigInt(index));
  const fragmentsByStart: number[][] = Array.from({ length: 100 }, () => []);

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

  function countReachableFragments(
    currentEnd: number,
    usedMask: bigint,
  ): number {
    visitedEnds.fill(false);
    endsToVisit.length = 0;
    outgoingCounts.fill(0);
    incomingCounts.fill(0);
    endsToVisit.push(currentEnd);

    let reachableFragments = 0;

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

        reachableFragments++;

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

    return Math.max(0, reachableFragments - requiredRemovals);
  }

  function search(currentEnd: number, usedMask: bigint): void {
    if (currentPath.length > bestPath.length) {
      bestPath = [...currentPath];
    }

    const maximumPossibleLength =
      currentPath.length + countReachableFragments(currentEnd, usedMask);

    if (maximumPossibleLength <= bestPath.length) {
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
      search(fragmentEnds[nextIndex], usedMask | nextBit);
      currentPath.pop();
    }
  }

  for (let startIndex = 0; startIndex < fragments.length; startIndex++) {
    currentPath.push(startIndex);
    search(fragmentEnds[startIndex], fragmentBits[startIndex]);
    currentPath.pop();
  }

  return combineFragments(bestPath.map((index) => fragments[index]));
}

const result = solve(FRAGMENTS);
