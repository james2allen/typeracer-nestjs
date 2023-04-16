import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

const uri = 'http://api.quotable.io/random';

interface QuotableResponse {
  _id: string;
  content: string;
  author: string;
  authorSlug: string;
  length: number;
  tags: string[];
}

@Injectable()
export class QuotableService {
  constructor(private readonly httpService: HttpService) {}

  async getQuote(): Promise<string[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<QuotableResponse>(uri).pipe(
        catchError((err: AxiosError) => {
          console.log(err.response.data);
          throw 'Quotable has thrown an error';
        }),
      ),
    );

    return data.content.split(' ');
  }
}
