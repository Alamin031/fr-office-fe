 async createNetworkProduct(createProductDto: CreateNetworkProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Product
      const product = new Product();
      Object.assign(product, createProductDto);
      
      delete (product as any).networks;
      delete (product as any).images;
      delete (product as any).videos;
      delete (product as any).specifications;

      const savedProduct = await queryRunner.manager.save(Product, product);

      // 2. Save Images, Videos, Specs (Same as Basic)
      if ((createProductDto as any).images) {
        const images = (createProductDto as any).images.map((img: any) => {
          const image = new ProductImage();
          image.productId = savedProduct.id;
          image.imageUrl = img.url;
          image.isThumbnail = img.isThumbnail;
          image.altText = img.altText;
          image.displayOrder = img.displayOrder;
          return image;
        });
        await queryRunner.manager.save(ProductImage, images);
      }

      if ((createProductDto as any).videos) {
        const videos = (createProductDto as any).videos.map((vid: any) => {
          const video = new ProductVideo();
          video.productId = savedProduct.id;
          video.videoUrl = vid.videoUrl;
          video.videoType = vid.videoType;
          video.displayOrder = vid.displayOrder;
          return video;
        });
        await queryRunner.manager.save(ProductVideo, videos);
      }

      if ((createProductDto as any).specifications) {
        const specs = (createProductDto as any).specifications.map((s: any) => {
          const spec = new ProductSpecification();
          spec.productId = savedProduct.id;
          spec.specKey = s.specKey;
          spec.specValue = s.specValue;
          spec.displayOrder = s.displayOrder;
          return spec;
        });
        await queryRunner.manager.save(ProductSpecification, specs);
      }

      // 3. Save Networks
      if (createProductDto.networks) {
        for (const n of createProductDto.networks) {
          const network = new ProductNetwork();
          network.productId = savedProduct.id;
          network.networkType = n.networkName || n.name; // Handle both naming conventions
          network.priceAdjustment = n.priceAdjustment;
          network.isDefault = n.isDefault ?? false;
          network.displayOrder = n.displayOrder ?? 0;

          const savedNetwork = await queryRunner.manager.save(ProductNetwork, network);

          // Save Default Storages for Network
          if (n.defaultStorages) {
            for (const ds of n.defaultStorages) {
              const storage = new ProductStorage();
              storage.networkId = savedNetwork.id; // Linked to network directly
              storage.storageSize = ds.storageSize;
              storage.displayOrder = ds.displayOrder ?? 0;
              
              const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

              const price = new ProductPrice();
              price.storageId = savedStorage.id;
              price.regularPrice = ds.regularPrice ?? 0;
              price.comparePrice = ds.comparePrice;
              price.discountPrice = ds.discountPrice;
              price.discountPercent = (ds as any).discountPercent;
              price.stockQuantity = ds.stockQuantity ?? 0;
              price.lowStockAlert = ds.lowStockAlert ?? 0;
              
              await queryRunner.manager.save(ProductPrice, price);
            }
          }

          // Save Colors for Network
          if (n.colors) {
            for (const c of n.colors) {
              const color = new ProductColor();
              color.networkId = savedNetwork.id;
              color.colorName = c.colorName;
              color.colorImage = c.colorImage;
              color.hasStorage = (c as any).hasStorage ?? true;
              color.useDefaultStorages = (c as any).useDefaultStorages ?? true;
              color.singlePrice = c.regularPrice; // Map regularPrice to singlePrice if no storage
              color.singleComparePrice = c.comparePrice;
              color.singleStockQuantity = c.stockQuantity;
              // Map new fields
              color.regularPrice = c.regularPrice;
              color.discountPrice = c.discountPrice;
              color.stockQuantity = c.stockQuantity;
              
              color.displayOrder = c.displayOrder ?? 0;

              const savedColor = await queryRunner.manager.save(ProductColor, color);

              // Save Custom Storages if not using defaults
              if (c.storages && !color.useDefaultStorages) {
                for (const s of c.storages) {
                  const storage = new ProductStorage();
                  storage.colorId = savedColor.id;
                  storage.storageSize = s.storageSize;
                  storage.displayOrder = s.displayOrder ?? 0;
                  
                  const savedStorage = await queryRunner.manager.save(ProductStorage, storage);

                  const price = new ProductPrice();
                  price.storageId = savedStorage.id;
                  price.regularPrice = s.regularPrice ?? 0;
                  price.comparePrice = s.comparePrice;
                  price.discountPrice = s.discountPrice;
                  price.discountPercent = (s as any).discountPercent;
                  price.stockQuantity = s.stockQuantity ?? 0;
                  price.lowStockAlert = s.lowStockAlert ?? 0;
                  
                  await queryRunner.manager.save(ProductPrice, price);
                }
              }
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.slug);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err.code === 11000) {
        throw new BadRequestException(this.extractDuplicateField(err));
      }
      throw new InternalServerErrorException(err.message);
    } finally {
      await queryRunner.release();
    }
  }