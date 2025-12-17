const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database path
const dbPath = path.join(__dirname, 'data', 'db.json');

// Database helper functions
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Database not found, running seed...');
    execSync('node scripts/seed.js', { cwd: __dirname });
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize database on startup
readDB();

// ============ USER ROUTES ============

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.status(401).json({ success: false, message: '用户名或密码错误' });
  }
});

// Get user profile
app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: '用户不存在' });
  }
});

// ============ EVENT ROUTES ============

// Get all events
app.get('/api/events', (req, res) => {
  const db = readDB();
  const { search, category } = req.query;
  
  let events = db.events;
  
  if (search) {
    events = events.filter(e => 
      e.name.includes(search) || 
      e.description.includes(search) ||
      e.venue.includes(search)
    );
  }
  
  if (category) {
    events = events.filter(e => e.category === category);
  }
  
  res.json(events);
});

// Get single event
app.get('/api/events/:id', (req, res) => {
  const db = readDB();
  const event = db.events.find(e => e.id === req.params.id);
  
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: '活动不存在' });
  }
});

// ============ SEAT ROUTES ============

// Get seats for an event
app.get('/api/events/:eventId/seats', (req, res) => {
  const db = readDB();
  const seats = db.seats.filter(s => s.eventId === req.params.eventId);
  res.json(seats);
});

// Lock a seat (when user selects it)
app.post('/api/seats/:seatId/lock', (req, res) => {
  const { userId } = req.body;
  const db = readDB();
  
  const seatIndex = db.seats.findIndex(s => s.id === req.params.seatId);
  
  if (seatIndex === -1) {
    return res.status(404).json({ success: false, message: '座位不存在' });
  }
  
  const seat = db.seats[seatIndex];
  
  if (seat.status === 'sold') {
    return res.status(400).json({ success: false, message: '座位已售出' });
  }
  
  if (seat.status === 'locked' && seat.lockedBy !== userId) {
    return res.status(400).json({ success: false, message: '座位已被其他用户锁定' });
  }
  
  // Lock the seat
  db.seats[seatIndex] = {
    ...seat,
    status: 'locked',
    lockedBy: userId,
    lockedAt: new Date().toISOString()
  };
  
  writeDB(db);
  res.json({ success: true, seat: db.seats[seatIndex] });
});

// Unlock a seat
app.post('/api/seats/:seatId/unlock', (req, res) => {
  const { userId } = req.body;
  const db = readDB();
  
  const seatIndex = db.seats.findIndex(s => s.id === req.params.seatId);
  
  if (seatIndex === -1) {
    return res.status(404).json({ success: false, message: '座位不存在' });
  }
  
  const seat = db.seats[seatIndex];
  
  if (seat.lockedBy !== userId) {
    return res.status(403).json({ success: false, message: '无权解锁此座位' });
  }
  
  db.seats[seatIndex] = {
    ...seat,
    status: 'available',
    lockedBy: null,
    lockedAt: null
  };
  
  writeDB(db);
  res.json({ success: true });
});

// ============ ORDER ROUTES ============

// Create order (purchase seats)
app.post('/api/orders', (req, res) => {
  const { userId, seatIds } = req.body;
  const db = readDB();

  // Validate all seats are locked by this user
  const seats = seatIds.map(id => db.seats.find(s => s.id === id));

  for (const seat of seats) {
    if (!seat) {
      return res.status(400).json({ success: false, message: '座位不存在' });
    }
    if (seat.status === 'sold') {
      return res.status(400).json({ success: false, message: `座位 ${seat.seatNumber} 已售出` });
    }
    if (seat.lockedBy !== userId) {
      return res.status(400).json({ success: false, message: `座位 ${seat.seatNumber} 未被您锁定` });
    }
  }

  // Calculate total price
  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

  // Create order
  const order = {
    id: `order-${Date.now()}`,
    userId,
    seatIds,
    eventId: seats[0].eventId,
    totalPrice,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  // Update seats to sold
  seatIds.forEach(seatId => {
    const index = db.seats.findIndex(s => s.id === seatId);
    if (index !== -1) {
      db.seats[index].status = 'sold';
      db.seats[index].lockedBy = null;
      db.seats[index].lockedAt = null;
    }
  });

  // Add order
  db.orders.push(order);

  // Update stats
  db.stats.totalRevenue += totalPrice;
  db.stats.totalTicketsSold += seatIds.length;
  db.stats.lastUpdated = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, order });
});

// Get user orders
app.get('/api/users/:userId/orders', (req, res) => {
  const db = readDB();
  const orders = db.orders.filter(o => o.userId === req.params.userId);

  // Enrich with event and seat details
  const enrichedOrders = orders.map(order => {
    const event = db.events.find(e => e.id === order.eventId);
    const seats = order.seatIds.map(id => db.seats.find(s => s.id === id));
    return { ...order, event, seats };
  });

  res.json(enrichedOrders);
});

// ============ ADMIN ROUTES ============

// Get admin stats
app.get('/api/admin/stats', (req, res) => {
  const db = readDB();

  // Calculate stats
  const totalSeats = db.seats.length;
  const soldSeats = db.seats.filter(s => s.status === 'sold').length;
  const lockedSeats = db.seats.filter(s => s.status === 'locked').length;
  const availableSeats = db.seats.filter(s => s.status === 'available').length;

  // Event-wise stats
  const eventStats = db.events.map(event => {
    const eventSeats = db.seats.filter(s => s.eventId === event.id);
    const sold = eventSeats.filter(s => s.status === 'sold').length;
    const revenue = eventSeats.filter(s => s.status === 'sold').reduce((sum, s) => sum + s.price, 0);
    return {
      eventId: event.id,
      eventName: event.name,
      totalSeats: eventSeats.length,
      soldSeats: sold,
      revenue
    };
  });

  res.json({
    totalSeats,
    soldSeats,
    lockedSeats,
    availableSeats,
    totalRevenue: db.stats.totalRevenue,
    totalOrders: db.orders.length,
    eventStats,
    lastUpdated: db.stats.lastUpdated
  });
});

// Reset system (re-seed database)
app.post('/api/admin/reset', (req, res) => {
  try {
    execSync('node scripts/seed.js', { cwd: __dirname });
    res.json({ success: true, message: '系统已重置' });
  } catch (error) {
    res.status(500).json({ success: false, message: '重置失败' });
  }
});

// Get all orders (admin)
app.get('/api/admin/orders', (req, res) => {
  const db = readDB();

  const enrichedOrders = db.orders.map(order => {
    const event = db.events.find(e => e.id === order.eventId);
    const user = db.users.find(u => u.id === order.userId);
    const seats = order.seatIds.map(id => db.seats.find(s => s.id === id));
    return {
      ...order,
      event,
      user: user ? { id: user.id, name: user.name, username: user.username } : null,
      seats
    };
  });

  res.json(enrichedOrders);
});

// ============ FEATURE 1: USER REGISTRATION ============

app.post('/api/auth/register', (req, res) => {
  const { username, password, name, email } = req.body;
  const db = readDB();

  // Validate input
  if (!username || !password || !name || !email) {
    return res.status(400).json({ success: false, message: '请填写所有必填字段' });
  }

  // Check if username exists
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }

  // Check if email exists
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: '邮箱已被注册' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    password,
    name,
    email,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, user: userWithoutPassword });
});

// ============ FEATURE 2: COUPON SYSTEM ============

// Validate coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code, totalAmount } = req.body;
  const db = readDB();

  const coupon = db.coupons.find(c => c.code === code && c.active);

  if (!coupon) {
    return res.status(404).json({ success: false, message: '优惠券不存在或已失效' });
  }

  const now = new Date();
  if (new Date(coupon.validFrom) > now || new Date(coupon.validTo) < now) {
    return res.status(400).json({ success: false, message: '优惠券不在有效期内' });
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ success: false, message: '优惠券已被领完' });
  }

  if (totalAmount < coupon.minPurchase) {
    return res.status(400).json({ success: false, message: `订单金额需满¥${coupon.minPurchase}` });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.floor(totalAmount * coupon.discountValue / 100);
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discount,
      finalAmount: totalAmount - discount
    }
  });
});

// Get all coupons
app.get('/api/coupons', (req, res) => {
  const db = readDB();
  const activeCoupons = db.coupons.filter(c => c.active);
  res.json(activeCoupons);
});

// ============ FEATURE 3: ORDER CANCELLATION & REFUND ============

app.post('/api/orders/:orderId/cancel', (req, res) => {
  const { userId } = req.body;
  const db = readDB();

  const orderIndex = db.orders.findIndex(o => o.id === req.params.orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: '订单不存在' });
  }

  const order = db.orders[orderIndex];

  if (order.userId !== userId) {
    return res.status(403).json({ success: false, message: '无权取消此订单' });
  }

  if (order.status === 'cancelled') {
    return res.status(400).json({ success: false, message: '订单已取消' });
  }

  // Check if within 24 hours
  const orderTime = new Date(order.createdAt);
  const now = new Date();
  const hoursDiff = (now - orderTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    return res.status(400).json({ success: false, message: '订单已超过24小时，无法取消' });
  }

  // Release seats back to available
  order.seatIds.forEach(seatId => {
    const seatIndex = db.seats.findIndex(s => s.id === seatId);
    if (seatIndex !== -1) {
      db.seats[seatIndex].status = 'available';
    }
  });

  // Update order status
  db.orders[orderIndex].status = 'cancelled';
  db.orders[orderIndex].cancelledAt = new Date().toISOString();
  db.orders[orderIndex].refundAmount = order.totalPrice;

  // Update stats
  db.stats.totalRevenue -= order.totalPrice;
  db.stats.totalTicketsSold -= order.seatIds.length;
  db.stats.lastUpdated = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, message: '订单已取消，退款将在3-5个工作日内到账', refundAmount: order.totalPrice });
});

// ============ FEATURE 4: FAVORITES/WISHLIST ============

// Add to favorites
app.post('/api/favorites', (req, res) => {
  const { userId, eventId } = req.body;
  const db = readDB();

  // Check if already favorited
  const existing = db.favorites.find(f => f.userId === userId && f.eventId === eventId);
  if (existing) {
    return res.status(400).json({ success: false, message: '已收藏该活动' });
  }

  const favorite = {
    id: `fav-${Date.now()}`,
    userId,
    eventId,
    createdAt: new Date().toISOString()
  };

  db.favorites.push(favorite);
  writeDB(db);
  res.json({ success: true, favorite });
});

// Remove from favorites
app.delete('/api/favorites/:eventId', (req, res) => {
  const { userId } = req.body;
  const db = readDB();

  const index = db.favorites.findIndex(f => f.userId === userId && f.eventId === req.params.eventId);
  if (index === -1) {
    return res.status(404).json({ success: false, message: '未收藏该活动' });
  }

  db.favorites.splice(index, 1);
  writeDB(db);
  res.json({ success: true });
});

// Get user favorites
app.get('/api/users/:userId/favorites', (req, res) => {
  const db = readDB();
  const userFavorites = db.favorites.filter(f => f.userId === req.params.userId);

  const enrichedFavorites = userFavorites.map(fav => {
    const event = db.events.find(e => e.id === fav.eventId);
    return { ...fav, event };
  });

  res.json(enrichedFavorites);
});

// ============ FEATURE 5: SEAT LOCK EXPIRATION ============

// Check and release expired locks (called periodically or on seat fetch)
function releaseExpiredLocks(db) {
  const now = new Date();
  const LOCK_TIMEOUT_MINUTES = 10;
  let released = 0;

  db.seats.forEach((seat, index) => {
    if (seat.status === 'locked' && seat.lockedAt) {
      const lockTime = new Date(seat.lockedAt);
      const minutesDiff = (now - lockTime) / (1000 * 60);

      if (minutesDiff > LOCK_TIMEOUT_MINUTES) {
        db.seats[index].status = 'available';
        db.seats[index].lockedBy = null;
        db.seats[index].lockedAt = null;
        released++;
      }
    }
  });

  return released;
}

// Endpoint to manually check expired locks
app.post('/api/seats/release-expired', (req, res) => {
  const db = readDB();
  const released = releaseExpiredLocks(db);
  if (released > 0) {
    writeDB(db);
  }
  res.json({ success: true, releasedCount: released });
});

// ============ FEATURE 6: USER PROFILE MANAGEMENT ============

// Update profile
app.put('/api/users/:id', (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const db = readDB();

  const userIndex = db.users.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  const user = db.users[userIndex];

  // Update name if provided
  if (name) {
    db.users[userIndex].name = name;
  }

  // Update email if provided
  if (email && email !== user.email) {
    if (db.users.find(u => u.email === email && u.id !== user.id)) {
      return res.status(400).json({ success: false, message: '邮箱已被使用' });
    }
    db.users[userIndex].email = email;
  }

  // Change password if provided
  if (currentPassword && newPassword) {
    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: '当前密码错误' });
    }
    db.users[userIndex].password = newPassword;
  }

  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDB(db);

  const { password: _, ...userWithoutPassword } = db.users[userIndex];
  res.json({ success: true, user: userWithoutPassword });
});

// ============ FEATURE 7: COMMENTS & RATINGS ============

// Add comment/rating
app.post('/api/events/:eventId/comments', (req, res) => {
  const { userId, rating, content } = req.body;
  const db = readDB();

  // Check if event exists
  const event = db.events.find(e => e.id === req.params.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: '活动不存在' });
  }

  // Check if user has purchased ticket for this event
  const hasPurchased = db.orders.some(o =>
    o.userId === userId &&
    o.eventId === req.params.eventId &&
    o.status === 'completed'
  );

  if (!hasPurchased) {
    return res.status(403).json({ success: false, message: '只有购票用户才能评价' });
  }

  // Check if already commented
  const existingComment = db.comments.find(c =>
    c.userId === userId && c.eventId === req.params.eventId
  );

  if (existingComment) {
    return res.status(400).json({ success: false, message: '您已评价过该活动' });
  }

  const user = db.users.find(u => u.id === userId);

  const comment = {
    id: `comment-${Date.now()}`,
    eventId: req.params.eventId,
    userId,
    userName: user?.name || '匿名用户',
    rating: Math.min(5, Math.max(1, rating)),
    content,
    createdAt: new Date().toISOString()
  };

  db.comments.push(comment);
  writeDB(db);
  res.json({ success: true, comment });
});

// Get event comments
app.get('/api/events/:eventId/comments', (req, res) => {
  const db = readDB();
  const comments = db.comments.filter(c => c.eventId === req.params.eventId);

  // Calculate average rating
  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0;

  res.json({
    comments,
    averageRating: parseFloat(avgRating),
    totalComments: comments.length
  });
});

// ============ ENHANCED: Orders with coupon support ============

app.post('/api/orders/with-coupon', (req, res) => {
  const { userId, seatIds, couponCode } = req.body;
  const db = readDB();

  // Release expired locks first
  releaseExpiredLocks(db);

  // Validate seats
  const seats = seatIds.map(id => db.seats.find(s => s.id === id));

  for (const seat of seats) {
    if (!seat) {
      return res.status(400).json({ success: false, message: '座位不存在' });
    }
    if (seat.status === 'sold') {
      return res.status(400).json({ success: false, message: `座位 ${seat.seatNumber} 已售出` });
    }
    if (seat.lockedBy !== userId) {
      return res.status(400).json({ success: false, message: `座位 ${seat.seatNumber} 未被您锁定` });
    }
  }

  // Calculate base price
  let totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);
  let discount = 0;
  let couponUsed = null;

  // Apply coupon if provided
  if (couponCode) {
    const coupon = db.coupons.find(c => c.code === couponCode && c.active);
    if (coupon && coupon.usedCount < coupon.maxUses && totalPrice >= coupon.minPurchase) {
      if (coupon.discountType === 'percentage') {
        discount = Math.floor(totalPrice * coupon.discountValue / 100);
      } else {
        discount = coupon.discountValue;
      }
      couponUsed = coupon.code;

      // Increment coupon usage
      const couponIndex = db.coupons.findIndex(c => c.id === coupon.id);
      db.coupons[couponIndex].usedCount++;
    }
  }

  const finalPrice = totalPrice - discount;

  // Create order
  const order = {
    id: `order-${Date.now()}`,
    userId,
    seatIds,
    eventId: seats[0].eventId,
    originalPrice: totalPrice,
    discount,
    couponCode: couponUsed,
    totalPrice: finalPrice,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  // Update seats to sold
  seatIds.forEach(seatId => {
    const index = db.seats.findIndex(s => s.id === seatId);
    if (index !== -1) {
      db.seats[index].status = 'sold';
      db.seats[index].lockedBy = null;
      db.seats[index].lockedAt = null;
    }
  });

  db.orders.push(order);
  db.stats.totalRevenue += finalPrice;
  db.stats.totalTicketsSold += seatIds.length;
  db.stats.lastUpdated = new Date().toISOString();

  writeDB(db);
  res.json({ success: true, order });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

