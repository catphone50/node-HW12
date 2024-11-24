import express from "express";
import { ObjectId } from "mongodb";
import cors from "cors";
import { connectToDatabase, getDB } from "./db/index.js";

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

connectToDatabase().then(
  () => {
    app.post("/products", async (req, res) => {
      const { name, price, description } = req.body;

      if (!name || !price || !description) {
        return res
          .status(400)
          .json({ error: "Name, price, and description are required" });
      }

      const product = {
        name,
        price,
        description,
      };

      try {
        const db = getDB();
        const result = await db.collection("products").insertOne(product);
        res.status(201).json({ _id: result.insertedId, ...product });
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
      }
    });

    app.get("/products", async (req, res) => {
      try {
        const db = getDB();
        const products = await db.collection("products").find().toArray();
        res.status(201).json(products);
      } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
      }
    });

    app.get("/products/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const db = getDB();
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
      }
    });

    app.put("/products/:id", async (req, res) => {
      const { id } = req.params;
      const { newName, newPrice, newDescription } = req.body;

      try {
        const db = getDB();
        const product = await db
          .collection("products")
          .findOne({ _id: new ObjectId(id) });
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        const newProduct = {
          name: newName || product.name,
          price: newPrice || product.price,
          description: newDescription || product.description,
        };

        await db
          .collection("products")
          .updateOne({ _id: new ObjectId(id) }, { $set: newProduct });

        const result = await db
          .collection("products")
          .findOne({ _id: new ObjectId(id) });

        res.json(result);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
      }
    });

    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const db = getDB();
        const result = await db
          .collection("products")
          .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Product not found" });
        }

        res.status(204).send("Was deleted");
      } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  },
  (err) => {
    console.log(
      "Failed to start the server due to MongoDB connection issue",
      error
    );
  }
);
