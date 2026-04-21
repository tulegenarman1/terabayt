import mysql from "mysql2/promise";

async function seedProducts() {
  try {
    // Create connection with SSL
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "localhost",
      user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
      password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
      database: process.env.DATABASE_URL?.split("/").pop()?.split("?")[0] || "terabayt",
      ssl: {
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
    });

    // Add sample products
    console.log("Adding products...");
    const products = [
      {
        categoryId: 1,
        name: "ASUS ROG Zephyrus G14",
        brand: "ASUS",
        price: "1299999",
        discountPrice: "1099999",
        description: "Мощный игровой ноутбук с RTX 4090",
        specs: JSON.stringify({ cpu: "Intel i9-13900H", gpu: "RTX 4090", ram: "32GB", storage: "1TB SSD" }),
        images: JSON.stringify([]),
        availability: "in_stock",
        kaspiLink: "https://kaspi.kz",
        featured: 1,
        categoryType: "gaming",
      },
      {
        categoryId: 2,
        name: "MacBook Pro 14",
        brand: "Apple",
        price: "2499999",
        discountPrice: null,
        description: "Ультрапроизводительный ноутбук",
        specs: JSON.stringify({ cpu: "M3 Pro", gpu: "Integrated", ram: "18GB", storage: "512GB SSD" }),
        images: JSON.stringify([]),
        availability: "in_stock",
        kaspiLink: "https://kaspi.kz",
        featured: 1,
        categoryType: "ultrabook",
      },
      {
        categoryId: 3,
        name: "Lenovo ThinkPad X1 Carbon",
        brand: "Lenovo",
        price: "899999",
        discountPrice: "799999",
        description: "Надёжный бизнес-ноутбук",
        specs: JSON.stringify({ cpu: "Intel i7-1365U", gpu: "Iris Xe", ram: "16GB", storage: "512GB SSD" }),
        images: JSON.stringify([]),
        availability: "in_stock",
        kaspiLink: "https://kaspi.kz",
        featured: 0,
        categoryType: "office",
      },
      {
        categoryId: 4,
        name: "HP Pavilion 15",
        brand: "HP",
        price: "449999",
        discountPrice: "399999",
        description: "Доступный ноутбук для повседневного использования",
        specs: JSON.stringify({ cpu: "AMD Ryzen 5", gpu: "Radeon", ram: "8GB", storage: "256GB SSD" }),
        images: JSON.stringify([]),
        availability: "in_stock",
        kaspiLink: "https://kaspi.kz",
        featured: 1,
        categoryType: "budget",
      },
      {
        categoryId: 1,
        name: "MSI GE76 Raider",
        brand: "MSI",
        price: "1599999",
        discountPrice: "1399999",
        description: "Экстремальный игровой ноутбук",
        specs: JSON.stringify({ cpu: "Intel i9-13900HX", gpu: "RTX 4080", ram: "32GB", storage: "1TB SSD" }),
        images: JSON.stringify([]),
        availability: "in_stock",
        kaspiLink: "https://kaspi.kz",
        featured: 1,
        categoryType: "gaming",
      },
    ];

    for (const product of products) {
      await connection.execute(
        `INSERT INTO products (categoryId, name, brand, price, discountPrice, description, specs, images, availability, kaspiLink, featured, categoryType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.categoryId,
          product.name,
          product.brand,
          product.price,
          product.discountPrice,
          product.description,
          product.specs,
          product.images,
          product.availability,
          product.kaspiLink,
          product.featured,
          product.categoryType,
        ]
      );
    }

    console.log("✓ Products added");
    console.log("✓ Database seeded successfully!");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error?.message || error);
    process.exit(1);
  }
}

seedProducts();
