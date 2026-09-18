const sequelize = require('../config/database');
const User = require('./User');
const Constituent = require('./Constituent');
const RequestCategory = require('./RequestCategory');
const Request = require('./Request');
const Budget = require('./Budget');
const Expenditure = require('./Expenditure');
const Payment = require('./Payment');
const Event = require('./Event');
const EventAttendee = require('./EventAttendee');
const Project = require('./Project');
const ProjectActivity = require('./ProjectActivity');
const AuditLog = require('./AuditLog');
const Document = require('./Document');
const Notification = require('./Notification');

// ------------------- MAHUSIANO (ASSOCIATIONS) -------------------

// User (1) --- (1) Constituent  (akaunti ya 'citizen' na profile yake ya mwananchi)
User.hasOne(Constituent, { foreignKey: 'userId', as: 'constituentProfile' });
Constituent.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Constituent (1) --- (N) Request
Constituent.hasMany(Request, { foreignKey: 'constituentId', as: 'requests' });
Request.belongsTo(Constituent, { foreignKey: 'constituentId', as: 'constituent' });

// RequestCategory (1) --- (N) Request
RequestCategory.hasMany(Request, { foreignKey: 'categoryId', as: 'requests' });
Request.belongsTo(RequestCategory, { foreignKey: 'categoryId', as: 'category' });

// User (1) --- (N) Request  (mtumiaji aliyeandikisha/anayeshughulikia ombi)
User.hasMany(Request, { foreignKey: 'submittedById', as: 'submittedRequests' });
Request.belongsTo(User, { foreignKey: 'submittedById', as: 'submittedBy' });

// RequestCategory (1) --- (N) Budget
RequestCategory.hasMany(Budget, { foreignKey: 'categoryId', as: 'budgets' });
Budget.belongsTo(RequestCategory, { foreignKey: 'categoryId', as: 'category' });

// User (1) --- (N) Budget (mtumiaji aliyeandaa/kutenga bajeti)
User.hasMany(Budget, { foreignKey: 'createdById', as: 'createdBudgets' });
Budget.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

// Request (1) --- (N) Expenditure  (ombi moja laweza kuwa na matumizi zaidi ya moja)
Request.hasMany(Expenditure, { foreignKey: 'requestId', as: 'expenditures' });
Expenditure.belongsTo(Request, { foreignKey: 'requestId', as: 'request' });

// Budget (1) --- (N) Expenditure  (fedha zilizoidhinishwa zinazotumika)
Budget.hasMany(Expenditure, { foreignKey: 'budgetId', as: 'expenditures' });
Expenditure.belongsTo(Budget, { foreignKey: 'budgetId', as: 'budget' });

// User (1) --- (N) Expenditure (mtumiaji aliyerekodi matumizi)
User.hasMany(Expenditure, { foreignKey: 'recordedById', as: 'recordedExpenditures' });
Expenditure.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });

// Expenditure (1) --- (N) Payment  (tumizi moja laweza kulipwa kwa vipande/awamu)
Expenditure.hasMany(Payment, { foreignKey: 'expenditureId', as: 'payments' });
Payment.belongsTo(Expenditure, { foreignKey: 'expenditureId', as: 'expenditure' });

// User (1) --- (N) Payment (mtumiaji aliyerekodi malipo)
User.hasMany(Payment, { foreignKey: 'recordedById', as: 'recordedPayments' });
Payment.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });

// User (1) --- (N) Event (mtumiaji aliyeandaa tukio)
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Event (1) --- (N) EventAttendee
Event.hasMany(EventAttendee, { foreignKey: 'eventId', as: 'attendees' });
EventAttendee.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Constituent (1) --- (N) EventAttendee (si lazima - mhudhuriaji anaweza kuwa mgeni)
Constituent.hasMany(EventAttendee, { foreignKey: 'constituentId', as: 'eventAttendances' });
EventAttendee.belongsTo(Constituent, { foreignKey: 'constituentId', as: 'constituent' });

// RequestCategory (1) --- (N) Project (aina ya mradi, si lazima)
RequestCategory.hasMany(Project, { foreignKey: 'categoryId', as: 'projects' });
Project.belongsTo(RequestCategory, { foreignKey: 'categoryId', as: 'category' });

// Constituent (1) --- (N) Project (eneo/mwananchi anayenufaika, si lazima)
Constituent.hasMany(Project, { foreignKey: 'constituentId', as: 'projects' });
Project.belongsTo(Constituent, { foreignKey: 'constituentId', as: 'constituent' });

// User (1) --- (N) Project (msimamizi wa mradi)
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// Project (1) --- (N) ProjectActivity
Project.hasMany(ProjectActivity, { foreignKey: 'projectId', as: 'activities' });
ProjectActivity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User (1) --- (N) ProjectActivity (mtumiaji aliyerekodi shughuli)
User.hasMany(ProjectActivity, { foreignKey: 'recordedById', as: 'recordedProjectActivities' });
ProjectActivity.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });

// User (1) --- (N) AuditLog (mtumiaji aliyefanya tendo)
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User (1) --- (N) Document (mtumiaji aliyeshiriki/kupakia hati)
User.hasMany(Document, { foreignKey: 'uploadedById', as: 'uploadedDocuments' });
Document.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

// User (1) --- (N) Document (mtumiaji aliyeidhinisha/kukataa hati)
User.hasMany(Document, { foreignKey: 'approvedById', as: 'approvedDocuments' });
Document.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });

// User (1) --- (N) Notification (mtumiaji anayepokea arifa)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });

// User (1) --- (N) Notification (mtumiaji aliyetuma arifa)
User.hasMany(Notification, { foreignKey: 'createdById', as: 'sentNotifications' });
Notification.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

// ------------------------------------------------------------------

// Kazi ya kuunganisha na kutengeneza tables zote (Awamu ya 1)
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Muunganiko na PostgreSQL umefanikiwa.');

    // alter: true - inasasisha tables zilizopo bila kuzifuta (nzuri kwa maendeleo)
    // Ukitaka kuanza upya kabisa, tumia { force: true } (INAFUTA DATA ZOTE)
    await sequelize.sync({ alter: true });
    console.log('✅ Tables zote (Users, Constituents, RequestCategories, Requests, Documents) zimetengenezwa/kusasishwa.');
  } catch (error) {
    console.error('❌ Imeshindwa kuunganisha na database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Constituent,
  RequestCategory,
  Request,
  Budget,
  Expenditure,
  Payment,
  Event,
  EventAttendee,
  Project,
  ProjectActivity,
  AuditLog,
  Document,
  Notification,
};