import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== Basic Product DTO ====================
export class CreateBasicProductDto {
  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro Max' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'iphone-15-pro-max' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: 'Short product description', example: 'Powerful A17 Pro chip with titanium design' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Latest flagship phone' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Category UUID', example: 'uuid-category' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Brand UUID', example: 'uuid-brand' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'IPHONE15PM' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiPropertyOptional({ description: 'SKU', example: 'IPH-15-PM-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'Warranty information', example: '1 Year Official Warranty' })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiPropertyOptional({ description: 'Is product active?', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Visible online?', example: true })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiPropertyOptional({ description: 'Visible in POS?', example: true })
  @IsOptional()
  @IsBoolean()
  isPos?: boolean;

  @ApiPropertyOptional({ description: 'Is pre-order?', example: false })
  @IsOptional()
  @IsBoolean()
  isPreOrder?: boolean;

  @ApiPropertyOptional({ description: 'Official product?', example: true })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @ApiPropertyOptional({ description: 'Free shipping?', example: true })
  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @ApiPropertyOptional({ description: 'EMI available?', example: false })
  @IsOptional()
  @IsBoolean()
  isEmi?: boolean;

  @ApiPropertyOptional({ description: 'Reward points', example: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardPoints?: number;

  @ApiPropertyOptional({ description: 'Minimum booking price for pre-order', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBookingPrice?: number;

  @ApiPropertyOptional({ description: 'SEO title', example: 'Buy iPhone 15 Pro Max - Best Price' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO keywords', example: ['iphone', 'apple', 'flagship'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiPropertyOptional({ description: 'Canonical URL' })
  @IsOptional()
  @IsString()
  seoCanonical?: string;

  @ApiPropertyOptional({ description: 'Product tags', example: ['flagship', 'premium'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Direct price (for simple products)', example: 2990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'Direct compare price', example: 3990 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Direct stock quantity', example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Low stock alert', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  lowStockAlert?: number;
}

// ==================== Network Product DTO ====================
export class CreateNetworkProductDto extends CreateBasicProductDto {
  @ApiPropertyOptional({ description: 'Product networks with variants (for network-based products like iPads)', type: [CreateProductNetworkDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductNetworkDto)
  networks?: CreateProductNetworkDto[];
}

// ==================== Region Product DTO ====================
export class CreateRegionProductDto extends CreateBasicProductDto {
  @ApiPropertyOptional({ description: 'Product regions with variants (for region-based products)', type: [CreateProductRegionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductRegionDto)
  regions?: CreateProductRegionDto[];
}
