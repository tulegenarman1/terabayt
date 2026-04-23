import * as db from "./server/db";

async function checkProducts() {
  const products = await db.getAllProducts();
  console.log("Total products:", products.length);
  console.log("First 5 products:");
  products.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Price: ${p.price}, CreatedAt: ${p.createdAt}`);
  });
  
  const hpLaptop = products.find(p => p.id === 14);
  if (hpLaptop) {
    console.log("\nDetails for Product ID 14:");
    console.log(JSON.stringify(hpLaptop, null, 2));
  } else {
    console.log("\nProduct ID 14 NOT found.");
  }
}

checkProducts().catch(console.error);
