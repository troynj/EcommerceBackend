const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// Handle GET requests to retrieve all products
router.get("/", async (req, res) => {
  // be sure to include its associated Category and Tag data
  try {
    // Retrieve all tags from the database
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: {attributes: []} }],
    });

    // Return the retrieved tags in the response
    return res.status(200).json(products);
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

// Handle GET requests to retrieve all products
router.get("/:id", async (req, res) => {
  try {
    // Find the user with the specified id using findByPk
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: {attributes: []}  }],
    });
    // be sure to include its associated Category and Tag data

    // If no user was found, return a 404 response with a message
    if (!product) {
      return res.status(404).send({ message: "product not found" });
    }

    // If the user was found, return a 200 response with the user object
    res.status(200).json(product);
  } catch (error) {
    // If there was an error while trying to find the user, return a 400 response with the error
    res.status(400).send(error);
  }
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 1,
      tagIds: [1, 2, 3, 4]
    }
  */
  // Use the Product model to create a new product
  Product.create(req.body)
    .then((product) => {
      // Check if there are any associated tags for the product
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        // Map the product and tag IDs into an array of objects
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          //return a join table for every element of req.body.tagIds
          return {
            product_id: product.id,
            tag_id,
          };
        });
        // Bulk create records in the ProductTag model
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete one product by its `id` value
  try {
    // Delete the tag with the given `id` from the database
    const deleted = await Product.destroy({ where: { id: req.params.id } });

    // If the tag is not found, return a 404 response with a message
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Return a success message in the response
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

module.exports = router;
