const searchService = require("../services/search.service");

exports.searchQuestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (q.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters long" });
    }

    const results = await searchService.searchQuestions(q);
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.searchByTags = async (req, res) => {
  try {
    const { tags } = req.query;
    if (!tags) {
      return res.status(400).json({ 
        success: false,
        message: "Tags parameter is required" 
      });
    }

    const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    if (tagArray.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "At least one valid tag is required" 
      });
    }

    if (tagArray.some(tag => tag.length < 2 || tag.length > 20)) {
      return res.status(400).json({ 
        success: false,
        message: "Each tag must be between 2 and 20 characters" 
      });
    }

    const results = await searchService.searchByTags(tagArray);
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.advancedSearch = async (req, res) => {
  try {
    const { query, tags, author, startDate, endDate } = req.query;
    
    // Validate at least one search criterion is provided
    if (!query && !tags && !author && !startDate) {
      return res.status(400).json({ 
        message: "At least one search criterion (query, tags, author, or date) is required" 
      });
    }

    // Format tags if provided
    const tagArray = tags ? tags.split(",").map(tag => tag.trim()) : [];
    
    // Validate dates if provided
    let dateRange = null;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (end < start) {
        return res.status(400).json({ message: "End date must be after start date" });
      }

      dateRange = { start, end };
    }

    const searchParams = {
      query,
      tags: tagArray,
      author,
      dateRange
    };

    const results = await searchService.advancedSearch(searchParams);
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};