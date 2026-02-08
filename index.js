// index.js

// postCategories function
async function postCategories(categoryDropdown) {
    // get list of categories from database
    const categoryRes = await fetch("/api/getCategories", {
        method: "GET"
    });
    const categoryList = await categoryRes.json();
    // create dropdown with array returned from database
    
    categoryList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.category;
        categoryDropdown.appendChild(option);
    });
    
} 

// main script begins here
const addExpenseBtn = document.getElementById("addExpenseBtn");
const viewExpensesBtn = document.getElementById("viewExpensesBtn");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const mainDiv = document.getElementById("mainDiv");

// event listenter for addExpenseBtn
addExpenseBtn.addEventListener("click", () => {
    // clear mainDiv
    mainDiv.textContent = "";
    // setup date entry
    const dateEntry = document.createElement("input");
    dateEntry.type = "date";
    mainDiv.appendChild(dateEntry);
    // setup list of categories
    const categoryDropdown = document.createElement("select");
    categoryDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a category";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    categoryDropdown.appendChild(defaultOption);
    mainDiv.appendChild(categoryDropdown);
    postCategories(categoryDropdown);
    // setup amount entry
    const amount = document.createElement("input");
    amount.type = "number";
    amount.step = "0.01";
    amount.min = "0";
    amount.placeholder = "$0.00";
    mainDiv.appendChild(amount);
    // setup notes
    const notes = document.createElement("input");
    notes.type = "text";
    notes.placeholder = "Add a note";
    mainDiv.appendChild(notes);
    // save button
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save Expense";
    mainDiv.appendChild(saveBtn);
    // event listener for saving
    saveBtn.addEventListener("click", async () => {
        const expenseData = {
            date: dateEntry.value,
            category_id: categoryDropdown.value,
            amount: parseFloat(amount.value),
            notes: notes.value
        };
        // validation
        if (!expenseData.date) {
            alert("Please select a date.");
            return;
        }
        if (!expenseData.category_id) {
            alert("Please select a category.");
            return;
        }
        if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        // send to backend
        const saveRes = await fetch("/api/saveExpense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });
        const result = await saveRes.json();
        mainDiv.textContent = "";
        alert("Expense saved!");
    });
});

