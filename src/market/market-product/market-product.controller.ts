// nest g resource로 폴더를 만들 수 있다

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UnauthorizedException, UseGuards, Query } from '@nestjs/common';
import { MarketProductService } from './market-product.service';
import { CreateMarketProductDto } from './dto/create-market-product.dto';
import { RefreshTokenGuard } from 'src/common/guards/bearer-token.guard';
import { OptionalBearerTokenGuard } from 'src/common/guards/optional-token.guard';
import { MarketProductCategory } from './const/product-category-enum.const';

@Controller('market/product')
export class MarketProductController {
  constructor(
    private readonly marketProductService: MarketProductService
  ) {}

  // 마켓 상품 등록
  @Post()
  @UseGuards(RefreshTokenGuard)
  async createMarketProduct(
    @Req() request:any,
    @Body() marketProduct: CreateMarketProductDto,
  ) {
    const userId = request.user.id;
    const userRole = request.user.role;

    if(userRole !== 'ARTIST'){
      throw new UnauthorizedException('작가만 마켓 상품을 등록할 수 있습니다.');
    }

    await this.marketProductService.createMarketProductImage(marketProduct.images);
    return this.marketProductService.createMarketProduct(userId, marketProduct);

  }

  // 마켓 상품 수정
  @Patch('update/:id')
  @UseGuards(RefreshTokenGuard)
  async updateMarketProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProduct: Partial<CreateMarketProductDto>,
  ) {
    return this.marketProductService.updateMarketProduct(id, updateProduct);
  }

  // 마켓 상품 삭제
  @Delete('delete/:id')
  @UseGuards(RefreshTokenGuard)
  async deleteMarketProduct(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.marketProductService.deleteMarketProduct(id);
  }

  // 마켓 상품 전체 조회
  @Get()
  @UseGuards(OptionalBearerTokenGuard)
  getMarketProduct(
    @Query('category') category?: MarketProductCategory,
  ) {
    return this.marketProductService.getMarketProduct(category);
  }

  // 마켓 상품 상세 조회
  @Get(':id')
  @UseGuards(OptionalBearerTokenGuard)
  getMarketProductById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.marketProductService.getMarketProductById(id);
  }



}

