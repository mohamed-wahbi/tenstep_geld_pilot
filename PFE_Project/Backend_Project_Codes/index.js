const express =require('express');
require ('./config/connect.js')
require("dotenv").config()
const app = express();
const cors = require('cors');

// Imported Routes :
const authRoutes = require('./routes/authRoute.js');
const authorizationUserRoutes = require('./routes/authorizedUserRoute.js');
const clientRoutes = require('./routes/clientRoute.js');
const expenseFixRoutes = require('./routes/expenseFixRoute.js');
const invoiceRoutes = require('./routes/invoiceRoute.js');
const revenueRoutes = require('./routes/revenueRoute.js');
const invoiceHistoryRoutes = require('./routes/invoiceHistoryRoute.js');
const monthlyExpenseRoutes = require('./routes/monthlyExpenseRoute.js');
const monthlyExpenseResultRoutes = require('./routes/MonthlyExpenseResultRoute.js');
const monthlyExpenseHistoryRoutes = require('./routes/monthlyExpenseHistoryRoute.js');
const monthlyFinancialActivitiesRoutes = require('./routes/MonthlyFinancialActivitiesRoute.js');
const annualFinancialActivitiesRoutes = require('./routes/AnnualFinancialActivitiesRoute.js');

const testRoute = require ("./routes/testRoute.js")


const PredictionsRoutes = require ("./routes/PredictionRoutes/predictionRoute.js")





//middlwaere :
app.use(express.json());
app.use(cors());




// Path routes : 
app.use('/api/auth',authRoutes);
app.use('/api/authorization',authorizationUserRoutes);
app.use('/api/client',clientRoutes);
app.use('/api/expense-fix',expenseFixRoutes);
app.use('/api/invoice',invoiceRoutes);
app.use('/api/revenue',revenueRoutes); 
app.use('/api/invoice-history',invoiceHistoryRoutes); 
app.use('/api/monthly-expense',monthlyExpenseRoutes); 
app.use('/api/monthly-expense-result',monthlyExpenseResultRoutes); 
app.use('/api/monthly-expense-history',monthlyExpenseHistoryRoutes); 
app.use('/api/monthly-financial-activitie',monthlyFinancialActivitiesRoutes); 
app.use('/api/annual-financial-activitie',annualFinancialActivitiesRoutes); 
app.use('/api/test',testRoute); 
app.use('/api',PredictionsRoutes); 





const PORT = process.env.SERVER_PORT
app.listen(PORT,()=>console.log(`Server is active on PORT: ${PORT} *_*`))

