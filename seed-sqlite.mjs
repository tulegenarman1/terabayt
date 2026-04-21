import { createClient } from "@libsql/client";

async function seedProducts() {
  const client = createClient({
    url: "file:sqlite.db",
  });

  try {
    console.log("Cleaning existing data...");
    await client.execute("DELETE FROM products");
    await client.execute("DELETE FROM categories");

    console.log("Adding categories...");
    const categories = [
      { id: 1, name: "Ноутбуки", slug: "laptops", description: "Мощные ноутбуки для любых задач" },
      { id: 2, name: "Телефоны", slug: "phones", description: "Современные смартфоны" },
      { id: 3, name: "Принтеры", slug: "printers", description: "Принтеры и МФУ" },
    ];

    for (const cat of categories) {
      await client.execute({
        sql: "INSERT INTO categories (id, name, slug, description) VALUES (?, ?, ?, ?)",
        args: [cat.id, cat.name, cat.slug, cat.description],
      });
    }

    console.log("Database cleaned. Categories added. No products added so you can add them yourself!");
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    client.close();
  }
}

seedProducts();
