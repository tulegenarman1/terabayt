import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  connectionLimit: 1,
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'terabayt',
});

async function seedDatabase() {
  try {
    const connection = await pool.getConnection();

    // Add categories
    const categories = [
      { name: 'Gaming', slug: 'gaming', description: 'Мощные ноутбуки для игр' },
      { name: 'Ultrabook', slug: 'ultrabook', description: 'Тонкие и лёгкие ноутбуки' },
      { name: 'Office', slug: 'office', description: 'Ноутбуки для работы' },
      { name: 'Budget', slug: 'budget', description: 'Доступные ноутбуки' },
    ];

    for (const cat of categories) {
      await connection.execute(
        'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [cat.name, cat.slug, cat.description]
      );
    }

    console.log('✓ Категории добавлены');

    // Add sample products
    const products = [
      {
        categoryId: 1,
        name: 'ASUS ROG Zephyrus G14',
        brand: 'ASUS',
        price: '1299999',
        discountPrice: '1099999',
        description: 'Мощный игровой ноутбук с RTX 4090',
        specs: JSON.stringify({ cpu: 'Intel i9-13900H', gpu: 'RTX 4090', ram: '32GB', storage: '1TB SSD' }),
        images: JSON.stringify([]),
        availability: 'in_stock',
        kaspiLink: 'https://kaspi.kz',
        featured: true,
      },
      {
        categoryId: 2,
        name: 'MacBook Pro 14"',
        brand: 'Apple',
        price: '2499999',
        discountPrice: null,
        description: 'Ультрапроизводительный ноутбук',
        specs: JSON.stringify({ cpu: 'M3 Pro', gpu: 'Integrated', ram: '18GB', storage: '512GB SSD' }),
        images: JSON.stringify([]),
        availability: 'in_stock',
        kaspiLink: 'https://kaspi.kz',
        featured: true,
      },
      {
        categoryId: 3,
        name: 'Lenovo ThinkPad X1 Carbon',
        brand: 'Lenovo',
        price: '899999',
        discountPrice: '799999',
        description: 'Надёжный бизнес-ноутбук',
        specs: JSON.stringify({ cpu: 'Intel i7-1365U', gpu: 'Iris Xe', ram: '16GB', storage: '512GB SSD' }),
        images: JSON.stringify([]),
        availability: 'in_stock',
        kaspiLink: 'https://kaspi.kz',
        featured: false,
      },
      {
        categoryId: 4,
        name: 'HP Pavilion 15',
        brand: 'HP',
        price: '449999',
        discountPrice: '399999',
        description: 'Доступный ноутбук для повседневного использования',
        specs: JSON.stringify({ cpu: 'AMD Ryzen 5', gpu: 'Radeon', ram: '8GB', storage: '256GB SSD' }),
        images: JSON.stringify([]),
        availability: 'in_stock',
        kaspiLink: 'https://kaspi.kz',
        featured: true,
      },
      {
        categoryId: 1,
        name: 'MSI GE76 Raider',
        brand: 'MSI',
        price: '1599999',
        discountPrice: '1399999',
        description: 'Экстремальный игровой ноутбук',
        specs: JSON.stringify({ cpu: 'Intel i9-13900HX', gpu: 'RTX 4080', ram: '32GB', storage: '1TB SSD' }),
        images: JSON.stringify([]),
        availability: 'in_stock',
        kaspiLink: 'https://kaspi.kz',
        featured: true,
      },
    ];

    for (const product of products) {
      await connection.execute(
        `INSERT INTO products (categoryId, name, brand, price, discountPrice, description, specs, images, availability, kaspiLink, featured, categoryType, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
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
          'office',
        ]
      );
    }

    console.log('✓ Товары добавлены');

    await connection.release();
    console.log('✓ База данных успешно инициализирована');
    process.exit(0);
  } catch (error) {
    console.error('✗ Ошибка:', error);
    process.exit(1);
  }
}

seedDatabase();
