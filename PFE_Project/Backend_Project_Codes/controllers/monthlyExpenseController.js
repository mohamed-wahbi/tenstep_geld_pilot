const asyncHandler = require("express-async-handler");
const {CreateMonthlyExpenseValidation,UpdateMonthlyExpenseValidation,MonthlyExpense} = require ("../models/monthlyExpenseModel.js");
const { ExpenseFix } = require("../models/ExpenseFixModel.js");




/*--------------------------------------------------
* @desc    Create new manuely MonthlyExpense
* @router  /api/monthly-Expense/create
* @methode POST
* @access  only admin
----------------------------------------------------*/
module.exports.createOneManuelyCtrl = asyncHandler(async(req,res)=> {

    const { expenseName, expenseType, estimatedAmount, month, year , actualAmount} = req.body;

    // Vérification des données envoyées
    if (!expenseName || !expenseType || !month || !year || !actualAmount ) {
      return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const newExpense = new MonthlyExpense({
      expenseName,
      expenseType,
      estimatedAmount,
      actualAmount,
      month,
      year,
    });

    await newExpense.save();
    res.status(201).json({ message: "Dépense ajoutée avec succès !" });
})






/*--------------------------------------------------
* @desc    Create new MonthlyExpense
* @router  /api/monthly-Expense/create
* @methode POST
* @access  only admin
----------------------------------------------------*/
module.exports.createMonthlyExpenseCtrl = asyncHandler(async(req,res)=> {

    try {
        const { month, year, expenseIds } = req.body;
    
        if (!month || !year || !expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
          return res.status(400).json({ message: "Données invalides." });
        }
    
        // Récupérer toutes les dépenses fixes en fonction des _id fournis
        const expenses = await ExpenseFix.find({ _id: { $in: expenseIds } });
    
        if (expenses.length === 0) {
          return res.status(404).json({ message: "Aucune dépense fixe trouvée." });
        }
    
        // Créer les nouvelles charges mensuelles
        const monthlyExpenses = expenses.map(expense => ({
          month,
          year,
          expenseId: expense._id,
          expenseName: expense.expenseName,
          expenseType: expense.expenseType,
          estimatedAmount: expense.status === "Fixed" ? expense.amount : 0, // Fixe = montant réel
          actualAmount: expense.status === "Fixed" ? expense.amount : 0, // Fixe = montant réel
          chargeStatus: expense.status==="Fixed" || this.estimatedAmount>this.actualAmount ? "Charge Normale" : "Not Covred", // Par défaut
        }));
    
        // Insérer les nouvelles charges mensuelles en base
        const insertedExpenses = await MonthlyExpense.insertMany(monthlyExpenses);
    
        res.status(201).json({ message: "Charges mensuelles créées avec succès.", data: insertedExpenses });
      } catch (error) {
        console.error("Erreur lors de la création des charges mensuelles :", error);
        res.status(500).json({ message: "Erreur serveur." });
      }

})




/*--------------------------------------------------
* @desc    Get All MonthlyExpense
* @router  /api/monthly-Expense/getAll
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllMonthlyExpenseCtrl = asyncHandler(async(req,res)=> {
    const monthlyExpenses = await MonthlyExpense.find();
    if(monthlyExpenses.length === 0){
        return res.status(400).json({
            message: "no monthlyExpenses in the data base"
        })
    }

    res.status(201).json({
        monthlyExpenses
    })
})



/*--------------------------------------------------
* @desc    Delete one MonthlyExpense
* @router  /api/monthly-Expense/deleteOne
* @methode DELETE
* @access  only admin
----------------------------------------------------*/
module.exports.deleteOneMonthlyExpenseCtrl = asyncHandler(async(req,res)=> {
    const deleteOnemonthlyExpenses = await MonthlyExpense.findByIdAndDelete({_id:req.params.id});
    if(!deleteOnemonthlyExpenses){
        return res.status(400).json({
            message: "no monthlyExpenses with this id in the data base"
        })
    }

    res.status(201).json({
        message: "monthly Expenses is deleted successfully."
    })
})



/*--------------------------------------------------
* @desc    Update one MonthlyExpense
* @router  /api/monthly-Expense/updateOne
* @methode PUT
* @access  only admin
----------------------------------------------------*/
module.exports.updateOneMonthlyExpenseCtrl = asyncHandler(async (req, res) => {
    // Récupérer le document avant mise à jour
    const existingExpense = await MonthlyExpense.findById(req.params.id);
    if (!existingExpense) {
        return res.status(404).json({
            message: "No monthly expense found with this ID in the database",
        });
    }

    // Appliquer la mise à jour
    const updatedExpense = await MonthlyExpense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedExpense) {
        return res.status(400).json({
            message: "Failed to update monthly expense",
        });
    }

    // Recalculer et mettre à jour chargeStatus si nécessaire
    if (req.body.estimatedAmount !== undefined || req.body.actualAmount !== undefined) {
        
        updatedExpense.chargeStatus =
            updatedExpense.actualAmount > updatedExpense.estimatedAmount 
                ? "Surcharge"
                : "Charge Normale";
        
        
        // Sauvegarder la mise à jour
        await updatedExpense.save();
    }

    res.status(200).json({
        message: "Monthly expense updated successfully",
        updatedExpense,
    });
});