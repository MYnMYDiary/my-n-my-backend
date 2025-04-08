import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { RefreshTokenGuard } from 'src/common/guards/bearer-token.guard';
import { OptionalBearerTokenGuard } from 'src/common/guards/optional-token.guard';

@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
  ) {}

//마켓 생성
@Post()
@UseGuards(RefreshTokenGuard)
createMarket(
  @Req() request:any,
  @Body() createMarketDto: CreateMarketDto
) {
  const userId = request.user?.id;
  const userRole = request.user?.role;

  if(userRole !== 'ARTIST'){
    throw new UnauthorizedException('작가만 마켓을 생성할 수 있습니다.');
  }

  return this.marketService.createMarket(createMarketDto, userId);
}

//마켓 조회
@Get()
@UseGuards(OptionalBearerTokenGuard)
getMarket(
  @Req() request:any
) {
  const userId: number = request.user?.id;
  return this.marketService.getMarket(userId);
}

//마켓 구독
@Post('subscribe')
@UseGuards(RefreshTokenGuard)
subscribeMarket(
  @Req() request:any,
  @Body() body: { marketId: number }
) {
  const userId = request.user?.id;
  return this.marketService.subscribeMarket(userId, body.marketId);
}
}
