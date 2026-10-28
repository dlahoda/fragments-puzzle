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
    // "854036",
    // "687762",
    // "389097",
    // "013153",
    // "417085",
    // "919198",
    // "988711",
    // "488665"
];

function combineFragments(fragments: string[]): string {
    return fragments.reduce((acc, fragment) => {
        if (acc === '') {
            return fragment;
        }
        return acc + fragment.slice(2);
    }, '');
}

//TODO consider using a graph traversal algorithm to find the longest path through the fragments
//TODO consider using a recursive function to find the longest path through the fragments
//TODO consider using a dynamic programming approach to find the longest path through the fragments
//TODO consider using a backtracking approach to find the longest path through the fragments
//TODO consider using a depth-first search approach to find the longest path through the fragments
//TODO consider using a breadth-first search approach to find the longest path through the fragments
//TODO consider using a greedy approach to find the longest path through the fragments
//TODO consider using a divide and conquer approach to find the longest path through the fragments


function solve(fragments:string[]):[number, string[]] {
    const cache = new Map<string, string[]>();
    const results: [number, string[]][] = [];

    const fragmentsMap = new Map<string, string[]>();
    for (const fragment of fragments) {
        const start = fragment.slice(0, 2);
        fragmentsMap.set(fragment, [start]);
    }

    const fragmentsByStart = new Map<string, string[]>();
    for (const [fragment, [start]] of fragmentsMap.entries()) {
        if (!fragmentsByStart.has(start)) {
            fragmentsByStart.set(start, []);
        }
        fragmentsByStart.get(start)?.push(fragment);
    }

    fragmentsMap.forEach((_value, key) => {
        function getAppendableFragments(end: string, usedFragments: string[] = []): string[] {
            const fragments = fragmentsByStart.get(end) || [];
            const appendableFragments = fragments.filter(f => !usedFragments.includes(f));
            return appendableFragments;
        }

        function combineFragmentsRecursively(fragments: string[], combinationLength: number = 1): [number, string[]] {
            const lastFragment = fragments[fragments.length - 1];
            const sortedFragments = [...fragments].sort();
            const cacheKey = `${lastFragment}-{${sortedFragments.join(',')}}`;

            let bestPath = { 
                length: combinationLength, 
                fragments: [...fragments],
            };

            if (cache.has(cacheKey)) {
                const cachedTail = cache.get(cacheKey) || [];
                const combinedFragments = [...fragments, ...cachedTail];
                return [combinedFragments.length, combinedFragments];
            }

            const fragmentEnd = fragments[fragments.length - 1].slice(-2);
            const appendableFragments = getAppendableFragments(fragmentEnd, fragments);


            for (const nextFragment of appendableFragments) {
                fragments.push(nextFragment);
                const result = combineFragmentsRecursively(fragments, combinationLength + 1);
                if (result[0] > bestPath.length) {
                    bestPath = { length: result[0], fragments: result[1]};
                }
                fragments.pop();
            }

            return [bestPath.length, bestPath.fragments];
        }
        const result = combineFragmentsRecursively([key]);
        results.push(result);
    });
    const maxLength = results.length
        ? Math.max(...results.map(r => r[0]))
        : 0;
    
    const longestResults = results.find(r => r[0] === maxLength);
    return longestResults ?? [0, []];
}

const result = solve(FRAGMENTS);
console.log("combinedFragments: ", combineFragments(result[1]));
