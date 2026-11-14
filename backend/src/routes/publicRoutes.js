import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.js';
import { Category } from '../models/Category.js';
import { MenuItem } from '../models/MenuItem.js';
import { Table } from '../models/Table.js';
import { Special } from '../models/Special.js';
import { MenuInteraction } from '../models/MenuInteraction.js';
import { TableVisitSession } from '../models/TableVisitSession.js';
import { DishRating } from '../models/DishRating.js';
import { emitDishRatingUpdated } from '../socket/socketHandler.js';
import { processAssistantQuery, getRelatedDishes } from '../services/recommendationEngine.js';

const router = express.Router();

// 1. GET /api/public/restaurant
router.get('/restaurant', async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findOne().lean();
    if (!restaurant) {
      restaurant = await Restaurant.create({});
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
});

// 2. GET /api/public/tables/:qrToken
router.get('/tables/:qrToken', async (req, res, next) => {
  try {
    const { qrToken } = req.params;
    const table = await Table.findOne({ qrToken, isActive: true });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive table QR code. Please ask restaurant staff for assistance.',
      });
    }

    // Update scan analytics
    table.lastScannedAt = new Date();
    table.scanCount = (table.scanCount || 0) + 1;
    await table.save();

    // Check restaurant session expiry setting
    const restaurant = await Restaurant.findOne().lean();
    const expiryHours = restaurant?.ratingsSettings?.sessionExpiryHours || 4;

    // Check if client provided an existing session token
    let sessionToken = req.headers['x-table-session'];
    let sessionDoc = null;

    if (sessionToken) {
      const hash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      sessionDoc = await TableVisitSession.findOne({
        sessionTokenHash: hash,
        tableId: table._id,
        status: 'active',
        expiresAt: { $gt: new Date() },
      });
    }

    if (!sessionDoc) {
      sessionToken = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      sessionDoc = await TableVisitSession.create({
        tableId: table._id,
        sessionTokenHash: hash,
        expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
        ip: req.ip || '',
        userAgent: req.headers['user-agent'] || '',
      });
    } else {
      sessionDoc.lastActiveAt = new Date();
      await sessionDoc.save();
    }

    res.json({
      success: true,
      data: {
        id: table._id,
        label: table.label,
        location: table.location,
        capacity: table.capacity,
        sessionToken,
        sessionExpiresAt: sessionDoc.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/public/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Dish counts per category
    const counts = await MenuItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[c._id.toString()] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      dishCount: countMap[cat._id.toString()] || 0,
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
});

// 4. GET /api/public/menu
router.get('/menu', async (req, res, next) => {
  try {
    const { category, isVeg, search, badge } = req.query;

    const query = { isActive: true };

    if (category && category !== 'all' && category !== '') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [{ slug: category }, { name: new RegExp(`^${category}$`, 'i') }],
        }).lean();
        if (catDoc) {
          query.categoryId = catDoc._id;
        } else {
          return res.json({ success: true, count: 0, data: [] });
        }
      }
    }

    if (isVeg !== undefined && isVeg !== 'all' && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    if (badge) {
      query.badges = badge;
    }

    if (search && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { tags: regex },
        { keywords: regex },
      ];
    }

    const items = await MenuItem.find(query)
      .populate('categoryId', 'name slug image arabicName description')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

// 5. GET /api/public/menu/:itemId
router.get('/menu/:itemId', async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.itemId)
      .populate('categoryId', 'name slug image')
      .lean();

    if (!item || !item.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found or unavailable.',
      });
    }

    // Increment view count asynchronously
    MenuItem.findByIdAndUpdate(item._id, { $inc: { viewCount: 1 } }).exec();

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// 5b. GET /api/public/menu/:itemId/related - Individual Menu Item Recommendations
router.get('/menu/:itemId/related', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { isVeg, limit } = req.query;

    const related = await getRelatedDishes(itemId, { isVeg, limit });

    if (related === null) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or unavailable.',
      });
    }

    res.json({
      success: true,
      count: related.length,
      data: related,
    });
  } catch (error) {
    next(error);
  }
});

// 6. GET /api/public/specials
router.get('/specials', async (req, res, next) => {
  try {
    const now = new Date();
    const currentDay = now.getDay(); // 0 to 6

    const specials = await Special.find({ isActive: true })
      .populate({
        path: 'menuItemId',
        match: { isActive: true, isAvailable: true },
        populate: { path: 'categoryId', select: 'name slug' },
      })
      .sort({ priority: 1 })
      .lean();

    // Filter out specials whose date/recurring days don't match
    const validSpecials = specials.filter((spec) => {
      if (!spec.menuItemId) return false;
      if (spec.startDate && new Date(spec.startDate) > now) return false;
      if (spec.endDate && new Date(spec.endDate) < now) return false;
      if (spec.recurringDays && spec.recurringDays.length > 0) {
        if (!spec.recurringDays.includes(currentDay)) return false;
      }
      return true;
    });

    res.json({ success: true, data: validSpecials });
  } catch (error) {
    next(error);
  }
});

// 7. GET /api/public/popular
router.get('/popular', async (req, res, next) => {
  try {
    // Return admin bestseller/popular first, then high view count items
    const manualPopular = await MenuItem.find({
      isActive: true,
      isAvailable: true,
      badges: { $in: ['popular', 'bestseller', 'chef_choice'] },
    })
      .populate('categoryId', 'name slug')
      .limit(6)
      .lean();

    const manualIds = manualPopular.map((i) => i._id);

    const autoPopular = await MenuItem.find({
      isActive: true,
      isAvailable: true,
      _id: { $nin: manualIds },
    })
      .sort({ viewCount: -1 })
      .populate('categoryId', 'name slug')
      .limit(6 - manualPopular.length)
      .lean();

    const popular = [...manualPopular, ...autoPopular];

    res.json({ success: true, data: popular });
  } catch (error) {
    next(error);
  }
});

// 8. POST /api/public/assistant/message
router.post('/assistant/message', async (req, res, next) => {
  try {
    const {
      message,
      sessionId,
      action,
      referenceDishId,
      feedbackTargetDishId,
      interactionContext,
    } = req.body;

    const result = await processAssistantQuery(message, {
      sessionId,
      action,
      referenceDishId,
      feedbackTargetDishId,
      interactionContext,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// 8b. POST /api/public/assistant/reset
router.post('/assistant/reset', async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const result = await processAssistantQuery('reset', { sessionId, action: 'reset' });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// 9. POST /api/public/interactions
router.post('/interactions', async (req, res, next) => {
  try {
    const { menuItemId, interactionType, tableToken } = req.body;
    if (menuItemId) {
      await MenuInteraction.create({
        menuItemId,
        interactionType: interactionType || 'view',
        tableToken: tableToken || null,
        userAgent: req.headers['user-agent'] || '',
      });
      await MenuItem.findByIdAndUpdate(menuItemId, { $inc: { viewCount: 1 } });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// 10. GET /api/public/menu/:itemId/ratings
router.get('/menu/:itemId/ratings', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const menuItem = await MenuItem.findById(itemId)
      .select('name averageRating totalRatings ratingDistribution')
      .lean();

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    let userRating = null;
    const sessionToken = req.headers['x-table-session'];
    if (sessionToken) {
      const hash = crypto.createHash('sha256').update(sessionToken).digest('hex');
      const session = await TableVisitSession.findOne({
        sessionTokenHash: hash,
        status: 'active',
        expiresAt: { $gt: new Date() },
      });
      if (session) {
        const existing = await DishRating.findOne({
          menuItemId: itemId,
          tableVisitSessionId: session._id,
        }).lean();
        if (existing) userRating = existing.rating;
      }
    }

    res.json({
      success: true,
      data: {
        menuItemId: itemId,
        averageRating: menuItem.averageRating || 0,
        totalRatings: menuItem.totalRatings || 0,
        ratingDistribution: menuItem.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        userRating,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 11. POST /api/public/menu/:itemId/ratings
router.post('/menu/:itemId/ratings', async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rating } = req.body;
    const sessionToken = req.headers['x-table-session'] || req.body.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Ratings can only be submitted by customers seated at a dining table. Please scan your table QR code to rate this dish.',
      });
    }

    // Check restaurant ratings setting
    const restaurant = await Restaurant.findOne().lean();
    if (restaurant?.ratingsSettings?.isEnabled === false) {
      return res.status(403).json({
        success: false,
        message: 'Customer ratings are currently paused by the restaurant.',
      });
    }

    // Validate rating value
    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating. Please select between 1 and 5 stars.',
      });
    }

    // Validate session token
    const tokenHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
    const session = await TableVisitSession.findOne({ sessionTokenHash: tokenHash });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid table session token. Please rescan your table QR code to submit a rating.',
      });
    }

    if (session.status !== 'active' || new Date() > session.expiresAt) {
      return res.status(403).json({
        success: false,
        message: 'Your table session has expired. Please rescan your table QR code.',
      });
    }

    // Validate table is active
    const table = await Table.findById(session.tableId);
    if (!table || !table.isActive) {
      return res.status(403).json({
        success: false,
        message: 'The table associated with this session is inactive.',
      });
    }

    // Validate menuItem exists and is active
    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem || !menuItem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or is currently inactive.',
      });
    }

    // Check if updating an existing rating
    const existing = await DishRating.findOne({
      menuItemId: menuItem._id,
      tableVisitSessionId: session._id,
    });
    const isUpdate = !!existing;

    // Save/Update DishRating
    const ratingDoc = await DishRating.findOneAndUpdate(
      { menuItemId: menuItem._id, tableVisitSessionId: session._id },
      {
        rating: ratingValue,
        tableId: session.tableId,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Atomically recalculate accurate aggregate stats
    const stats = await DishRating.aggregate([
      { $match: { menuItemId: menuItem._id } },
      {
        $group: {
          _id: '$menuItemId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    const stat = stats[0] || {
      averageRating: 0,
      totalRatings: 0,
      star1: 0,
      star2: 0,
      star3: 0,
      star4: 0,
      star5: 0,
    };

    menuItem.averageRating = Math.round(stat.averageRating * 10) / 10;
    menuItem.totalRatings = stat.totalRatings;
    menuItem.ratingDistribution = {
      1: stat.star1,
      2: stat.star2,
      3: stat.star3,
      4: stat.star4,
      5: stat.star5,
    };
    await menuItem.save();

    // Emit real-time rating update via Socket.IO
    emitDishRatingUpdated({
      menuItemId: menuItem._id.toString(),
      averageRating: menuItem.averageRating,
      totalRatings: menuItem.totalRatings,
      ratingDistribution: menuItem.ratingDistribution,
    });

    res.json({
      success: true,
      message: isUpdate
        ? 'Your rating has been updated! Thank you for dining with us.'
        : 'Thank you! Your rating has been recorded.',
      data: {
        userRating: ratingDoc.rating,
        averageRating: menuItem.averageRating,
        totalRatings: menuItem.totalRatings,
        ratingDistribution: menuItem.ratingDistribution,
        isUpdate,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
