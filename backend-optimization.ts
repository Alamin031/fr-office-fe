// Update your products.controller.ts
// ADD THIS NEW METHOD alongside your existing findAll:

@Get()
@ApiOperation({ summary: 'Get all products with filters and pagination' })
@ApiQuery({ name: 'categoryId', required: false, type: String })
@ApiQuery({ name: 'brandId', required: false, type: String })
@ApiQuery({ name: 'isActive', required: false, type: Boolean })
@ApiQuery({ name: 'isOnline', required: false, type: Boolean })
@ApiQuery({ name: 'minPrice', required: false, type: Number })
@ApiQuery({ name: 'maxPrice', required: false, type: Number })
@ApiQuery({ name: 'search', required: false, type: String })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'offset', required: false, type: Number })
@ApiQuery({ name: 'productType', required: false, enum: ['basic', 'network', 'region'] })
@ApiQuery({ name: 'fields', required: false, type: String, description: 'Comma-separated fields to return. If provided, only returns lightweight data without nested relations' })
@ApiResponse({
  status: 200,
  description: 'List of products',
})
findAll(
  @Query('categoryId') categoryId?: string,
  @Query('brandId') brandId?: string,
  @Query('isActive') isActive?: boolean,
  @Query('isOnline') isOnline?: boolean,
  @Query('minPrice') minPrice?: number,
  @Query('maxPrice') maxPrice?: number,
  @Query('search') search?: string,
  @Query('limit') limit?: number,
  @Query('offset') offset?: number,
  @Query('productType') productType?: string,
  @Query('fields') fields?: string,
) {
  return this.productsService.findAll({
    categoryId,
    brandId,
    isActive,
    isOnline,
    minPrice,
    maxPrice,
    search,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    productType,
    fields,
  });
}

// ============================================================
// Update your products.service.ts - REPLACE the findAll method:
// ============================================================

async findAll(filters?: {
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isOnline?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
  productType?: string;
  fields?: string;
}) {
  const whereConditions: any = {};

  if (filters?.categoryId) {
    whereConditions.categoryId = new ObjectId(filters.categoryId);
  }
  if (filters?.brandId) {
    whereConditions.brandId = new ObjectId(filters.brandId);
  }
  if (filters?.isActive !== undefined) {
    whereConditions.isActive = filters.isActive;
  }
  if (filters?.isOnline !== undefined) {
    whereConditions.isOnline = filters.isOnline;
  }
  if (filters?.productType) {
    whereConditions.productType = filters.productType;
  }

  // If fields parameter is provided, return lightweight data without expensive nested relations
  if (filters?.fields) {
    const fieldsArray = filters.fields.split(',').map(f => f.trim());
    
    const products = await this.productRepository.find({
      where: whereConditions,
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
      order: { createdAt: 'DESC' },
      relations: ['images'], // Only load images if needed for list
    });

    // Return only requested fields
    return {
      data: products.map(product => {
        const result: any = {};
        fieldsArray.forEach(field => {
          if (field === 'images') {
            result.images = product.images?.map(img => ({
              id: img.id,
              url: img.imageUrl,
              isThumbnail: img.isThumbnail,
              altText: img.altText,
            }));
          } else if (product.hasOwnProperty(field)) {
            result[field] = (product as any)[field];
          }
        });
        return result;
      }),
      total: await this.productRepository.count({ where: whereConditions }),
    };
  }

  // Original full-detail logic (for detail pages, not for list)
  const products = await this.productRepository.find({
    where: whereConditions,
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
    order: { createdAt: 'DESC' },
    relations: [
      'images',
      'videos',
      'specifications',
      'networks',
      'regions',
      'directColors',
    ],
  });

  if (products.length === 0) {
    return {
      data: [],
      total: 0,
    };
  }

  // Load nested relations for each product (ONLY for full detail requests)
  const productsWithFullRelations = await Promise.all(
    products.map(async (product) => {
      await this.loadProductRelations(product);
      return product;
    }),
  );

  const formatted = productsWithFullRelations.map((product) =>
    this.formatProductResponse(product),
  );

  return {
    data: formatted,
    total: await this.productRepository.count({ where: whereConditions }),
  };
}