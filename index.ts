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
//   "246027",
//   "854036",
//   "687762",
//   "389097",
//   "013153",
//   "417085",
//   "919198",
//   "988711",
//   "488665"
];

function combineFragments(fragments: string[]): string {
  return fragments.reduce((acc, fragment) => {
    if (acc === "") {
      return fragment;
    }
    return acc + fragment.slice(2);
  }, "");
}

//TODO consider using a graph traversal algorithm to find the longest path through the fragments
//TODO consider using a recursive function to find the longest path through the fragments
//TODO consider using a dynamic programming approach to find the longest path through the fragments
//TODO consider using a backtracking approach to find the longest path through the fragments
//TODO consider using a depth-first search approach to find the longest path through the fragments
//TODO consider using a breadth-first search approach to find the longest path through the fragments
//TODO consider using a greedy approach to find the longest path through the fragments
//TODO consider using a divide and conquer approach to find the longest path through the fragments

function solve(fragments: string[]): string {
  const cache = Array.from(
    { length: fragments.length },
    () => new Map<bigint, number[]>(),
  );

  const results: [number, number[]][] = [];

  const fragmentsMap = new Map<number, string[]>();
  for (
    let fragmentIndex = 0;
    fragmentIndex < fragments.length;
    fragmentIndex++
  ) {
    const start = fragments[fragmentIndex].slice(0, 2);
    fragmentsMap.set(fragmentIndex, [start]);
  }
  // for (Л

  const fragmentsByStart = new Map<string, number[]>();
  for (const [fragmentIndex, [start]] of fragmentsMap.entries()) {
    if (!fragmentsByStart.has(start)) {
      fragmentsByStart.set(start, []);
    }
    fragmentsByStart.get(start)?.push(fragmentIndex);
  }

  fragmentsMap.forEach((_value, fragmentIndex) => {
    function getAppendableFragments(end: string, usedMask: bigint): number[] {
      const fragments = fragmentsByStart.get(end) || [];
      const appendableFragments = fragments.filter((f) => {
        const bit = 1n << BigInt(f);
        return (usedMask & bit) === 0n;
      });
      return appendableFragments;
    }

    function combineFragmentsRecursively(
      fragmentsIndexArr: number[],
      usedMask: bigint,
      combinationLength: number = 1,
    ): [number, number[]] {
      const lastFragmentIndex = fragmentsIndexArr[fragmentsIndexArr.length - 1];
      const currentCache = cache[lastFragmentIndex];

      let bestPath = {
        length: combinationLength,
        fragments: [...fragmentsIndexArr],
      };

      if (currentCache.has(usedMask)) {
        const cachedTail = currentCache.get(usedMask) || [];
        const combinedFragments = [...fragmentsIndexArr, ...cachedTail];
        return [combinedFragments.length, combinedFragments];
      }

      const fragmentEndIndex = fragmentsIndexArr[fragmentsIndexArr.length - 1];
      const fragmentEnd = fragments[fragmentEndIndex].slice(-2);
      const appendableFragments = getAppendableFragments(fragmentEnd, usedMask);
      // console.log("🚀 ~ combineFragmentsRecursively ~ appendableFragments:", appendableFragments)

      for (const nextFragment of appendableFragments) {
        fragmentsIndexArr.push(nextFragment);
        const nextBit = 1n << BigInt(nextFragment);
        const nextUsedMask = usedMask | nextBit;
        const result = combineFragmentsRecursively(
          fragmentsIndexArr,
          nextUsedMask,
          combinationLength + 1,
        );
        if (result[0] > bestPath.length) {
          bestPath = { length: result[0], fragments: result[1] };
        }
        fragmentsIndexArr.pop();
      }

      const bestTail = bestPath.fragments.slice(fragmentsIndexArr.length);

      currentCache.set(usedMask, bestTail);

      return [bestPath.length, bestPath.fragments];
    }
    const startMask = 1n << BigInt(fragmentIndex);
    const result = combineFragmentsRecursively([fragmentIndex], startMask);
    results.push(result);
  });
  const maxLength = results.length ? Math.max(...results.map((r) => r[0])) : 0;

  const longestResults = results.find((r) => r[0] === maxLength);
  const longestResultCombined = longestResults
    ? combineFragments(longestResults[1].map((i) => fragments[i]))
    : "";
  return longestResultCombined;
}

const result = solve(FRAGMENTS);
console.log("🚀 ~ result:", result);
