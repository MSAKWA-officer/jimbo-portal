require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const { syncDatabase } = require('./models');

const authRoutes = require('./routes/authRoutes');
const constituentRoutes = require('./routes/constituentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const expenditureRoutes = require('./routes/expenditureRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventAttendeeRoutes = require('./routes/eventAttendeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectActivityRoutes = require('./routes/projectActivityRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');


const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// STATIC UPLOADED FILES
// ==========================================

// Files uploaded by users
// backend/uploads/letters/...
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message:
      'Mfumo wa Maombi ya Wananchi unafanya kazi.',
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/constituents',
  constituentRoutes
);

app.use(
  '/api/categories',
  categoryRoutes
);

app.use(
  '/api/requests',
  requestRoutes
);

app.use(
  '/api/budgets',
  budgetRoutes
);

app.use('/api/expenditures', expenditureRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/event-attendees', eventAttendeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-activities', projectActivityRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
// ==========================================
// 404
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Njia (route) haipo.',
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    console.error(
      'SERVER ERROR:',
      err
    );

    res.status(500).json({
      message:
        'Hitilafu ya server.',
      error: err.message,
    });
  }
);

// ==========================================
// START SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

const start = async () => {
  try {
    await syncDatabase();

    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server inaendesha kwenye http://localhost:${PORT}`
        );

        console.log(
          `📁 Uploads: http://localhost:${PORT}/uploads`
        );
      }
    );
  } catch (error) {
    console.error(
      'SERVER START ERROR:',
      error
    );

    process.exit(1);
  }
};

start();
