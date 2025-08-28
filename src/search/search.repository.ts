import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchRepository{
    constructor(private readonly prisma: PrismaService){}

    const result = await this.prisma.$queryRaw`
    SELECT title, ts_rank_cd(textsearch, qeury, 32) AS rank
    FROM Post, to_tsquery('$1') query,
     WHERE query @@ textsearch
     ORDER BY rank DESC and TIME
     LIMIT 10;
    `

    
}