import { ImATeapotException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';

/*
 * Go to https://developer.clashofclans.com/#/account
 * to create a key
 */
const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjkwYmJlMTIzLTA2ZWUtNDA2NS1iYmJlLTNjZTQxMTc5MTkzZSIsImlhdCI6MTY0MTc0Njc4Niwic3ViIjoiZGV2ZWxvcGVyLzllNzMyOTRiLWM5ZTEtNTUxMC0zMGIxLWZlZWI0ZmFkYjFmZSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjc1LjEzNS4xNjcuNDIiXSwidHlwZSI6ImNsaWVudCJ9XX0.vS4at5vvYz60AVOdTswGyN3Ou0NfHGR1pSk9RNv9ebqExT2WFX8aqp0ud4VmPnA0QXsyiqwDu3NheH54NE8-zg';
const BASE_URL = 'https://api.clashofclans.com/v1';
const CLAN_TAG = '#220YV20P';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async authorizedHttpGet<T>(url: string, config?: AxiosRequestConfig) {
    const axiosRequestConfig: AxiosRequestConfig = {
      ...config,
      headers: { Authorization: `Bearer ${TOKEN}` },
    };

    return this.httpService.get<T>(url, axiosRequestConfig);
  }

  async clashGet<T>(url: string, config?: AxiosRequestConfig) {
    try {
      const response = await this.authorizedHttpGet<T>(url, config);
      const { data } = await response.toPromise();
      return data;
    } catch (e) {
      throw new ImATeapotException(e.response.data);
    }
  }

  async getClanWarLeague(): Promise<ClanWarLeague> {
    const encodedClanTag = encodeURIComponent(CLAN_TAG);

    return await this.clashGet<ClanWarLeague>(
      `${BASE_URL}/clans/${encodedClanTag}/currentwar/leaguegroup`,
    );
  }

  async getPlayerWarStats(name = 'A5YearOld') {
    const { rounds: leagueRounds } = await this.getClanWarLeague();
    const rounds = leagueRounds.flatMap((round) => [...round.warTags]);
  }
}

interface ClanWarLeague {
  tag: string;
  state: string;
  season: string;
  clans: [
    {
      tag: string;
      clanLevel: number;
      name: string;
      members: Member[];
      badgeUrls: any;
    },
  ];
  rounds: WarTag[];
}

interface Member {
  tag: string;
  townHallLevel: number;
  name: string;
}

interface WarTag {
  warTags: string[];
}
