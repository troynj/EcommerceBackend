const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  const { id } = req.params;
  try {
    const tagData = await Tag.findByBk(req.params.id, {
      where: { id },
      include: { model: product_tag },
    });

    if (!tagData) {
      res.status(404).json({ message: "No Tag found with that id!" });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new category
  try {
    // Create a new tag with the extracted data
    const createdTag = await Category.create(req.body);

    // Return the newly created tag in the response
    return res.status(201).json(createdTag);
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

// Handle PUT requests to update a category's name by its `id` value
router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    const { id } = req.params
    // Update the tag's name in the database
    //returns an array of the updated rows
    const [updated] = await Category.update(req.body, {
      where: { id },
    });
    
    // If the tag is not found, return a 404 response with a message
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
  
    // Fetch the updated category data
    const updatedCategory = await Category.findByPk(id);
    // Return the updated category data in the response
    return res.status(200).json(updatedCategory);
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
    // Delete the tag with the given `id` from the database
    const deleted = await Category.destroy({ where: { id: req.params.id } });

    // If the tag is not found, return a 404 response with a message
    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Return a success message in the response
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

module.exports = router;
