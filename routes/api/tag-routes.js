const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll(req.params.id, {
      include: [{ model: ProductTag }]
    });

    if (!tagData) {
      res.status(404).json({ message: 'No Tag found with that id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});

// Handle POST requests to create a new tag
router.post('/', async (req, res) => {
  try {
    // Create a new tag with the extracted data
    const createdTag = await Tag.create(req.body);

    // Return the newly created tag in the response
    return res.status(201).json(createdTag);
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});
  
// Handle PUT requests to update a tag's name by its `id` value
router.put('/:id', async (req, res) => {
  try {
    // Deconstruct the `id` value from the URL parameters
    const { id } = req.params;
    // Deconstruct the new name from the request body
    const { tag_name } = req.body;

    // Update the tag's name in the database
    //returns an array of the updated rows
    const [updated] = await Tag.update({ tag_name }, { where: { id } });

    // If the tag is not found, return a 404 response with a message
    if (!updated) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Fetch the updated tag data
    const updatedTag = await Tag.findByPk(id);

    // Return the updated tag data in the response
    return res.status(200).json(updatedTag);
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

// Handle DELETE requests to delete a tag by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    // Extract the `id` value from the URL parameters
    const { id } = req.params;

    // Delete the tag with the given `id` from the database
    const deleted = await Tag.destroy({ where: { id } });

    // If the tag is not found, return a 404 response with a message
    if (!deleted) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Return a success message in the response
    return res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (err) {
    // In case of any errors, return a 400 response with the error message
    return res.status(400).json(err);
  }
});

module.exports = router;
