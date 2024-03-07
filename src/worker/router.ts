import { defineRouter, defineRoute } from 'twrpc'
import { z } from 'zod'
import Fuse from 'fuse.js'

function runFuzzySearch(data: { id: string, title?: string, description?: string }[], query: string) {
  const fuse = new Fuse(data, {
    keys: [{
      name: 'title',
      weight: 0.7,
    }, {
      name: 'description',
      weight: 0.2,
    }],
    shouldSort: true,
    findAllMatches: true,
    includeMatches: true,
    includeScore: true,
    minMatchCharLength: 3,
    threshold: 0.3,
    ignoreLocation: true,
    isCaseSensitive: false,
    useExtendedSearch: false,
    sortFn: (a, b) => a.score - b.score,
  });

  return fuse.search(query).map((result) => ({
    id: result.item.id,
    score: result.score!,
  }));
}

const router = defineRouter({
  search: defineRoute({
    input: z.object({
      query: z.string(),
      data: z.array(z.object({
        id: z.string(),
        title: z.string().optional().default(''),
        description: z.string().optional().default(''),
      })),
    }),
    handler: ({ input }) => {
      return runFuzzySearch(input.data, input.query);
    },
  }),
});

// Also export the router type for use on the client
type Router = typeof router;

export { router };
export type { Router };