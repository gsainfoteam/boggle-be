import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type SearchRow = {
  id: string;
  title: string | null;
  rank: number;
  createdAt: Date;
  snippet?: string | null;
};

const DOC = Prisma.sql`
(
    setweight(to_tsvector('english', COALESCE(p.title, '')), 'A') ||
    setweight(to_tsvector('english', immutable_array_to_string(p.tags, ' ')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p.content, '')), 'C')
)
`;

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async webSearch(
    q: string,
    { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
  ): Promise<SearchRow[]> {
    const L = Math.min(Math.max(limit, 1), 100);
    const O = Math.max(offset, 0);

    return await this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
            WITH query AS (
                SELECT websearch_to_tsquery('english', ${q}) AS q
            )
            SELECT
                p.id,
                p.title,
                ts_rank_cd(${DOC}, query.q) AS rank,
                p."createdAt"
            FROM
                "Post" p,
                query
            WHERE
                ${DOC} @@ query.q
            ORDER BY
                rank DESC,
                p."createdAt" DESC
            OFFSET ${O}
            LIMIT ${L};
        `);
  }
}
