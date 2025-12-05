 // ============================================
// 1️⃣ CREATE BASIC PRODUCT
// ============================================
async createBasicProduct(dto: CreateBasicProductDto): Promise<any> {
    // Check if product with same slug already exists
    const existingProduct = await this.productRepository.findOne({
      where: { slug: dto.slug },
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Product with slug "${dto.slug}" already exists`,
      );
    }

    // Check for duplicate productCode
    if (dto.productCode) {
      const existingCode = await this.productRepository.findOne({
        where: { productCode: dto.productCode },
      });
      if (existingCode) {
        throw new BadRequestException(
          `Product code "${dto.productCode}" already exists`,
        );
      }
    }

    // Check for duplicate SKU
    if (dto.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new BadRequestException(`SKU "${dto.sku}" already exists`);
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedProduct: Product | null = null;

    try {
      // 1. Create Product
      const product = queryRunner.manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId ? new ObjectId(dto.categoryId) : undefined,
        brandId: dto.brandId ? new ObjectId(dto.brandId) : undefined,
        productCode: dto.productCode,
        sku: dto.sku,
        warranty: dto.warranty,
        price: dto.price,
        comparePrice: dto.comparePrice,
        stockQuantity: dto.stockQuantity,
        lowStockAlert: dto.lowStockAlert,
        isActive: dto.isActive ?? true,
        isOnline: dto.isOnline ?? true,
        isPos: dto.isPos ?? true,
        isPreOrder: dto.isPreOrder ?? false,
        isOfficial: dto.isOfficial ?? false,
        freeShipping: dto.freeShipping ?? false,
        isEmi: dto.isEmi ?? false,
        rewardPoints: dto.rewardPoints ?? 0,
        minBookingPrice: dto.minBookingPrice ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
        seoCanonical: dto.seoCanonical,
        tags: dto.tags,
        faqIds: dto.faqIds
          ? dto.faqIds.map((id) => new ObjectId(id))
          : undefined,
      });

      savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Create Basic Product Colors (Simple colors with optional storage)
      if (dto.colors && dto.colors.length > 0) {
        for (const colorDto of dto.colors) {
          const color = queryRunner.manager.create(ProductColor, {
            productId: new ObjectId(savedProduct.id),
            colorName: colorDto.colorName,
            colorImage: colorDto.colorImage,
            hasStorage: false, // Basic products don't have storage variants
            singlePrice: colorDto.regularPrice,
            singleComparePrice: colorDto.comparePrice,
            singleDiscountPrice: colorDto.discountPrice,
            singleStockQuantity: colorDto.stockQuantity,
            singleLowStockAlert: colorDto.lowStockAlert ?? 5,
            displayOrder: colorDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductColor, color);
        }
      }

      // 3. Create Images, Videos, Specifications (shared logic)
      await this.createProductMedia(queryRunner, savedProduct.id, dto);

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.handleProductError(error, savedProduct);
    } finally {
      await queryRunner.release();
    }
  }

// ============================================
// 2️⃣ CREATE NETWORK PRODUCT
// ============================================
async createNetworkProduct(dto: CreateNetworkProductDto): Promise<any> {
    // Validation checks (same as basic)
    await this.validateProductUniqueness(dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedProduct: Product | null = null;

    try {
      // 1. Create Product
      const product = queryRunner.manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId ? new ObjectId(dto.categoryId) : undefined,
        brandId: dto.brandId ? new ObjectId(dto.brandId) : undefined,
        productCode: dto.productCode,
        sku: dto.sku,
        warranty: dto.warranty,
        isActive: dto.isActive ?? true,
        isOnline: dto.isOnline ?? true,
        isPos: dto.isPos ?? true,
        isPreOrder: dto.isPreOrder ?? false,
        isOfficial: dto.isOfficial ?? false,
        freeShipping: dto.freeShipping ?? false,
        isEmi: dto.isEmi ?? false,
        rewardPoints: dto.rewardPoints ?? 0,
        minBookingPrice: dto.minBookingPrice ?? 0,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        seoKeywords: dto.seoKeywords,
        seoCanonical: dto.seoCanonical,
        tags: dto.tags,
      });

      savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Create Networks with Colors and Storages
      if (dto.networks && dto.networks.length > 0) {
        for (const networkDto of networks) {
          if (!networkDto.networkType) {
            console.warn(
              'Skipping network creation due to missing networkType',
            );
            continue;
          }

          const network = queryRunner.manager.create(ProductNetwork, {
            productId: new ObjectId(savedProduct.id),
            networkType: networkDto.networkType,
            priceAdjustment: networkDto.priceAdjustment ?? 0,
            isDefault: networkDto.isDefault ?? false,
            displayOrder: networkDto.displayOrder ?? 0,
          });
          const savedNetwork = await queryRunner.manager.save(
            ProductNetwork,
            network,
          );

          // Create colors within this network
          if (networkDto.colors && networkDto.colors.length > 0) {
            for (const colorDto of networkDto.colors) {
              const color = queryRunner.manager.create(ProductColor, {
                productId: new ObjectId(savedProduct.id),
                networkId: savedNetwork
                  ? new ObjectId(savedNetwork.id)
                  : undefined,
                colorName: colorDto.colorName,
                colorImage: colorDto.colorImage,
                hasStorage: colorDto.hasStorage ?? true,
                singlePrice: colorDto.singlePrice,
                singleComparePrice: colorDto.singleComparePrice,
                singleStockQuantity: colorDto.singleStockQuantity,
                features: colorDto.features,
                displayOrder: colorDto.displayOrder ?? 0,
              });
              const savedColor = await queryRunner.manager.save(
                ProductColor,
                color,
              );

              // Create storages if hasStorage = true
              if (
                colorDto.hasStorage &&
                colorDto.storages &&
                colorDto.storages.length > 0
              ) {
                for (const storageDto of colorDto.storages) {
                  const storage = queryRunner.manager.create(ProductStorage, {
                    colorId: new ObjectId(savedColor.id),
                    storageSize: storageDto.storageSize,
                    displayOrder: storageDto.displayOrder ?? 0,
                  });
                  const savedStorage = await queryRunner.manager.save(
                    ProductStorage,
                    storage,
                  );

                  // Create Price for this storage
                  const price = new ProductPrice();
                  price.storageId = new ObjectId(savedStorage.id);
                  price.regularPrice = storageDto.price.regularPrice;
                  price.comparePrice = storageDto.price.comparePrice;
                  price.discountPrice = storageDto.price.discountPrice;
                  price.discountPercent = storageDto.price.discountPercent;
                  price.campaignPrice = storageDto.price.campaignPrice;
                  price.campaignStart = storageDto.price.campaignStart
                    ? new Date(storageDto.price.campaignStart)
                    : undefined;
                  price.campaignEnd = storageDto.price.campaignEnd
                    ? new Date(storageDto.price.campaignEnd)
                    : undefined;
                  price.stockQuantity = storageDto.price.stockQuantity;
                  price.lowStockAlert = storageDto.price.lowStockAlert ?? 5;
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      // 4. Create Regions → Default Storages + Colors (for region-based products)
      if (regions.length > 0) {
        for (const regionDto of regions) {
          const region = queryRunner.manager.create(ProductRegion, {
            productId: new ObjectId(savedProduct.id),
            regionName: regionDto.regionName,
            isDefault: regionDto.isDefault ?? false,
            displayOrder: regionDto.displayOrder ?? 0,
          });
          const savedRegion = await queryRunner.manager.save(
            ProductRegion,
            region,
          );

          // 4a. Create default storages for this region (shared by all colors)
          if (
            regionDto.defaultStorages &&
            regionDto.defaultStorages.length > 0
          ) {
            for (const storageDto of regionDto.defaultStorages) {
              const storage = queryRunner.manager.create(ProductStorage, {
                regionId: new ObjectId(savedRegion.id),
                storageSize: storageDto.storageSize,
                displayOrder: storageDto.displayOrder ?? 0,
              });
              const savedStorage = await queryRunner.manager.save(
                ProductStorage,
                storage,
              );

              // Create Price for this default storage
              const price = new ProductPrice();
              price.storageId = new ObjectId(savedStorage.id);
              price.regularPrice = storageDto.price.regularPrice;
              price.comparePrice = storageDto.price.comparePrice;
              price.discountPrice = storageDto.price.discountPrice;
              price.discountPercent = storageDto.price.discountPercent;
              price.campaignPrice = storageDto.price.campaignPrice;
              price.campaignStart = storageDto.price.campaignStart
                ? new Date(storageDto.price.campaignStart)
                : undefined;
              price.campaignEnd = storageDto.price.campaignEnd
                ? new Date(storageDto.price.campaignEnd)
                : undefined;
              price.stockQuantity = storageDto.price.stockQuantity;
              price.lowStockAlert = storageDto.price.lowStockAlert ?? 5;
              await queryRunner.manager.save(ProductPrice, price);
            }
          }

          // 4b. Create colors (which may use default storages or have custom storages)
          if (regionDto.colors && regionDto.colors.length > 0) {
            for (const colorDto of regionDto.colors) {
              const useDefaultStorages = colorDto.useDefaultStorages ?? true;

              const color = queryRunner.manager.create(ProductColor, {
                productId: new ObjectId(savedProduct.id),
                regionId: new ObjectId(savedRegion.id),
                colorName: colorDto.colorName,
                colorImage: colorDto.colorImage,
                hasStorage: colorDto.hasStorage ?? true,
                useDefaultStorages: useDefaultStorages,
                singlePrice: colorDto.singlePrice,
                singleComparePrice: colorDto.singleComparePrice,
                singleStockQuantity: colorDto.singleStockQuantity,
                features: colorDto.features,
                displayOrder: colorDto.displayOrder ?? 0,
              });
              const savedColor = await queryRunner.manager.save(
                ProductColor,
                color,
              );

              // Create custom storages only if useDefaultStorages = false
              if (
                colorDto.hasStorage &&
                !useDefaultStorages &&
                colorDto.storages &&
                colorDto.storages.length > 0
              ) {
                for (const storageDto of colorDto.storages) {
                  const storage = queryRunner.manager.create(ProductStorage, {
                    colorId: new ObjectId(savedColor.id),
                    storageSize: storageDto.storageSize,
                    displayOrder: storageDto.displayOrder ?? 0,
                  });
                  const savedStorage = await queryRunner.manager.save(
                    ProductStorage,
                    storage,
                  );

                  // Create Price for this custom storage
                  const price = new ProductPrice();
                  price.storageId = new ObjectId(savedStorage.id);
                  price.regularPrice = storageDto.price.regularPrice;
                  price.comparePrice = storageDto.price.comparePrice;
                  price.discountPrice = storageDto.price.discountPrice;
                  price.discountPercent = storageDto.price.discountPercent;
                  price.campaignPrice = storageDto.price.campaignPrice;
                  price.campaignStart = storageDto.price.campaignStart
                    ? new Date(storageDto.price.campaignStart)
                    : undefined;
                  price.campaignEnd = storageDto.price.campaignEnd
                    ? new Date(storageDto.price.campaignEnd)
                    : undefined;
                  price.stockQuantity = storageDto.price.stockQuantity;
                  price.lowStockAlert = storageDto.price.lowStockAlert ?? 5;
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      // 5. Create Images
      if (dto.images && dto.images.length > 0) {
        for (const imageDto of dto.images) {
          const image = queryRunner.manager.create(ProductImage, {
            productId: new ObjectId(savedProduct.id),
            imageUrl: imageDto.imageUrl,
            isThumbnail: imageDto.isThumbnail ?? false,
            altText: imageDto.altText,
            displayOrder: imageDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductImage, image);
        }
      }

      // 6. Create Videos
      if (dto.videos && dto.videos.length > 0) {
        for (const videoDto of dto.videos) {
          const video = queryRunner.manager.create(ProductVideo, {
            productId: new ObjectId(savedProduct.id),
            videoUrl: videoDto.videoUrl,
            videoType: videoDto.videoType,
            displayOrder: videoDto.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductVideo, video);
        }
      }

      // 7. Create Specifications
      if (dto.specifications && dto.specifications.length > 0) {
        for (const spec of dto.specifications) {
          const productSpec = queryRunner.manager.create(ProductSpecification, {
            productId: new ObjectId(savedProduct.id),
            specKey: spec.specKey,
            specValue: spec.specValue,
            displayOrder: spec.displayOrder ?? 0,
          });
          await queryRunner.manager.save(ProductSpecification, productSpec);
        }
      }

      await queryRunner.commitTransaction();

      // Return complete product with all relations
      return this.findOne(savedProduct.slug);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Log the full error for debugging
      console.error('Product creation error:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });

      // Manual cleanup for MongoDB (since transactions don't work properly without replica set)
      try {
        if (
          error.code === 11000 ||
          error.message?.includes('duplicate key') ||
          error.message?.includes('E11000')
        ) {
          console.log(
            'Attempting manual cleanup due to duplicate key error...',
          );

          // Check if it's a null regionName error
          if (error.message?.includes('regionName: null')) {
            // Delete regions with null regionName for this product
            await this.dataSource.manager.delete('ProductRegion', {
              productId: savedProduct?.id,
              regionName: null as any,
            });
            console.log('Cleaned up regions with null regionName');
          }

          const duplicateField = this.extractDuplicateField(error);
          throw new BadRequestException(
            `${duplicateField} already exists. Please use a different value. Database has been cleaned up, please try again.`,
          );
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }

      throw new InternalServerErrorException(
        `Failed to create product: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }