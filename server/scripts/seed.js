const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate 10x10 seat grid for an event
function generateSeats(eventId) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  rows.forEach((row, rowIndex) => {
    for (let col = 1; col <= 10; col++) {
      seats.push({
        id: `${eventId}-${row}${col}`,
        eventId,
        row,
        col,
        seatNumber: `${row}${col}`,
        status: 'available', // available, locked, sold
        price: rowIndex < 3 ? 280 : rowIndex < 6 ? 180 : 120, // VIP, Standard, Economy
        lockedBy: null,
        lockedAt: null
      });
    }
  });
  
  return seats;
}

// Sample events
const events = [
  {
    id: 'event-1',
    name: '周杰伦演唱会',
    description: '2024年世界巡回演唱会 - 北京站',
    venue: '国家体育场（鸟巢）',
    date: '2024-06-15',
    time: '19:30',
    image: 'https://picsum.photos/seed/event1/400/300',
    category: '演唱会'
  },
  {
    id: 'event-2',
    name: '话剧《茶馆》',
    description: '北京人民艺术剧院经典话剧',
    venue: '首都剧场',
    date: '2024-06-20',
    time: '19:00',
    image: 'https://picsum.photos/seed/event2/400/300',
    category: '话剧'
  },
  {
    id: 'event-3',
    name: '交响乐之夜',
    description: '柏林爱乐乐团中国巡演',
    venue: '国家大剧院',
    date: '2024-07-01',
    time: '20:00',
    image: 'https://picsum.photos/seed/event3/400/300',
    category: '音乐会'
  },
  {
    id: 'event-4',
    name: 'CBA篮球联赛',
    description: '北京首钢 vs 广东宏远',
    venue: '五棵松体育馆',
    date: '2024-07-10',
    time: '19:35',
    image: 'https://picsum.photos/seed/event4/400/300',
    category: '体育'
  },
  {
    id: 'event-5',
    name: '脱口秀大会',
    description: '2024年度精选脱口秀专场',
    venue: '北京喜剧中心',
    date: '2024-07-15',
    time: '20:00',
    image: 'https://picsum.photos/seed/event5/400/300',
    category: '脱口秀'
  },
  {
    id: 'event-6',
    name: '芭蕾舞剧《天鹅湖》',
    description: '俄罗斯国家芭蕾舞团演出',
    venue: '天桥艺术中心',
    date: '2024-08-01',
    time: '19:30',
    image: 'https://picsum.photos/seed/event6/400/300',
    category: '舞蹈'
  }
];

// Sample users
const users = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: 'user-2',
    username: 'zhangsan',
    password: '123456',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user'
  },
  {
    id: 'user-3',
    username: 'lisi',
    password: '123456',
    name: '李四',
    email: 'lisi@example.com',
    role: 'user'
  }
];

// Generate all seats for all events
const allSeats = events.flatMap(event => generateSeats(event.id));

// Sample coupons
const coupons = [
  {
    id: 'coupon-1',
    code: 'WELCOME10',
    description: '新用户专享10%折扣',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 100,
    maxUses: 100,
    usedCount: 0,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    active: true
  },
  {
    id: 'coupon-2',
    code: 'SAVE50',
    description: '满500减50',
    discountType: 'fixed',
    discountValue: 50,
    minPurchase: 500,
    maxUses: 50,
    usedCount: 0,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    active: true
  },
  {
    id: 'coupon-3',
    code: 'VIP20',
    description: 'VIP会员20%折扣',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 200,
    maxUses: 30,
    usedCount: 0,
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
    active: true
  }
];

// Database structure
const db = {
  users,
  events,
  seats: allSeats,
  orders: [],
  coupons,
  favorites: [],
  comments: [],
  stats: {
    totalRevenue: 0,
    totalTicketsSold: 0,
    lastUpdated: new Date().toISOString()
  }
};

// Write to file
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

console.log('✅ Database seeded successfully!');
console.log(`📊 Created ${users.length} users, ${events.length} events, ${allSeats.length} seats`);

