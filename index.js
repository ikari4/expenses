// index.js

// displayCategories function
async function displayCategories(categoryDropdown) {
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

// displayPaymentType function
async function displayPaymentTypes(paymentTypeDropdown) {
    // get list of payment types from database
    const paymentRes = await fetch("/api/getPaymentTypes", {
        method: "GET"
    });
    const paymentTypeList = await paymentRes.json();

    // create dropdown with array returned from database
    paymentTypeList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.payment;
        paymentTypeDropdown.appendChild(option);
    });
    
} 

// displayExpenses function
function displayExpenses(expensesToView) {
    lowerDiv.innerHTML= "";
    const table = document.createElement("table");
    table.className = "expenseTable";
    const headerRow = document.createElement("tr");
    ["Date", "Amount", "Category", "Payment"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // each expense info goes into a single table cell
    expensesToView.forEach(expense => {
        const row = document.createElement("tr");
        
        // format amount to have two decimal places
        const formattedAmount = `$${Number(expense.amount).toFixed(2)}`;
        const values = [
            expense.date,
            formattedAmount,
            expense.category,
            expense.payment
        ];
         values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });       
        table.appendChild(row);
    });

    lowerDiv.appendChild(table);
}

// main script begins here
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const username = localStorage.getItem("username");
const addExpenseBtn = document.createElement("button");
const viewExpenseBtn = document.createElement("button");
const editBtn = document.createElement("button");
const headerDiv = document.getElementById("headerDiv");
const mainDiv = document.getElementById("mainDiv");
const lowerDiv = document.getElementById("lowerDiv");

// on page load
window.addEventListener("load", async() => {
    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "block";
        return;
    }

    // display buttons in header
    loginModal.style.display = "none";
    addExpenseBtn.innerHTML = "Add $";
    headerDiv.appendChild(addExpenseBtn);
    viewExpenseBtn.innerHTML = "View";
    headerDiv.appendChild(viewExpenseBtn);
    editBtn.innerHTML = "Edit";
    headerDiv.appendChild(editBtn);

    // event listenter for addExpenseBtn
    addExpenseBtn.addEventListener("click", () => {
        
        // clear mainDiv
        mainDiv.textContent = "";

        // setup date entry
        const dateEntry = document.createElement("input");
        dateEntry.type = "date";
        dateEntry.value = new Date().toISOString().split("T")[0];
        dateEntry.className = "input";
        mainDiv.appendChild(dateEntry);

        // setup list of categories
        const categoryDropdown = document.createElement("select");
        categoryDropdown.innerHTML = "";
        categoryDropdown.className = "input";
        const defaultCategory = document.createElement("option");
        defaultCategory.value = "";
        defaultCategory.textContent = "Category";
        defaultCategory.selected = true;
        defaultCategory.disabled = true;
        categoryDropdown.appendChild(defaultCategory);
        mainDiv.appendChild(categoryDropdown);
        displayCategories(categoryDropdown);

        // setup list of payment types
        const paymentTypeDropdown = document.createElement("select");
        paymentTypeDropdown.innerHTML = "";
        paymentTypeDropdown.className = "input";
        const defaultPayment = document.createElement("option");
        defaultPayment.value = "";
        defaultPayment.textContent = "Payment Type";
        defaultPayment.selected = true;
        defaultPayment.disabled = true;
        paymentTypeDropdown.appendChild(defaultPayment);
        mainDiv.appendChild(paymentTypeDropdown);
        displayPaymentTypes(paymentTypeDropdown);

        // setup amount entry
        const amountWrapper = document.createElement("div");
        amountWrapper.className = "currencyWrapper";
        const amount = document.createElement("input");
        amount.type = "text";
        amount.inputMode = "decimal";
        amount.placeholder = "0.00";
        amount.className = "input currencyInput";
        amountWrapper.appendChild(amount);
        mainDiv.appendChild(amountWrapper);

        amount.addEventListener("blur", () => {
            if (!amount.value) return;
            const num = parseFloat(amount.value.replace(/[^0-9.]/g, ""));
            if (!isNaN(num)) {
                amount.value = num.toFixed(2);
            } else {
                amount.value = "";
            }
        });

        // setup notes
        const notes = document.createElement("input");
        notes.type = "text";
        notes.placeholder = "Note";
        notes.className = "input";
        mainDiv.appendChild(notes);

        // save button
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.classList = "saveBtn";
        mainDiv.appendChild(saveBtn);

        // event listener for saving
        saveBtn.addEventListener("click", async () => {
            saveBtn.disabled = true;
            saveBtn.innerHTML = "Wait...";
            const expenseData = {
                date: dateEntry.value,
                category_id: categoryDropdown.value,
                payment_id: paymentTypeDropdown.value,
                amount: Number(parseFloat(amount.value).toFixed(2)),
                notes: notes.value,
                user_id: parseInt(localStorage.getItem("userId"))
            };

            // validation
            if (!expenseData.date) {
                alert("Please select a date.");
                saveBtn.disabled = false;
                saveBtn.innerHTML = "Save";
                return;
            }
            if (!expenseData.category_id) {
                alert("Please select a category.");
                saveBtn.disabled = false;
                saveBtn.innerHTML = "Save";
                return;
            }
            if (!expenseData.payment_id) {
                alert("Please select a payment type.");
                saveBtn.disabled = false;
                saveBtn.innerHTML = "Save";
                return;
            }
            if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
                alert("Please enter a valid amount.");
                saveBtn.disabled = false;
                saveBtn.innerHTML = "Save";
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
            addExpenseBtn.click();
            alert("Expense saved!");
        });
    });

    // event listenter for editBtn
    editBtn.addEventListener("click", async () => {
        
        // clear mainDiv
        mainDiv.textContent = "";

        // add input and save for new category
        const addCategory = document.createElement("input");
        addCategory.type = "text";
        addCategory.placeholder = "Add a category";
        addCategory.className = "input";
        const addCategoryDiv = document.createElement("div");
        addCategoryDiv.appendChild(addCategory);
        const saveCatBtn = document.createElement("button");
        saveCatBtn.textContent = "Save";
        saveCatBtn.classList = "saveBtn";
        addCategoryDiv.appendChild(saveCatBtn);
        mainDiv.appendChild(addCategoryDiv);

        // event listener for saveCatBtn
        saveCatBtn.addEventListener("click", async () => {
            saveCatBtn.innerHTML = "Wait...";
            saveCatBtn.disabled = true;
            const categoryData = {
                category: addCategory.value
            }

            // validation
            if (!categoryData.category) {
                alert("Please enter a category.");
                saveCatBtn.disabled = false;
                saveCatBtn.innerHTML = "Save";
                return;
            }

            // send to backend
            const saveRes = await fetch("/api/saveCategory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(categoryData)
            });
            const result = await saveRes.json();
            editBtn.click();
            alert("Category saved!");

        });

        // add input and save for new payment type
        const addPaymentType = document.createElement("input");
        addPaymentType.type = "text";
        addPaymentType.placeholder = "Add a payment type";
        addPaymentType.className = "input";
        const addPaymentTypeDiv = document.createElement("div");
        addPaymentTypeDiv.appendChild(addPaymentType);
        const savePayBtn = document.createElement("button");
        savePayBtn.textContent = "Save";
        savePayBtn.classList = "saveBtn";
        addPaymentTypeDiv.appendChild(savePayBtn);
        mainDiv.appendChild(addPaymentTypeDiv);

        // event listener for savePayBtn
        savePayBtn.addEventListener("click", async () => {
            savePayBtn.innerHTML = "Wait...";
            savePayBtn.disabled = true;
            const paymentData = {
                payment: addPaymentType.value
            }

            // validation
            if (!paymentData.payment) {
                alert("Please enter a payment type.");
                savePayBtn.disabled = false;
                savePayBtn.innerHTML = "Save";
                return;
            }

            // send to backend
            const saveRes = await fetch("/api/savePaymentType", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });
            const result = await saveRes.json();
            editBtn.click();
            alert("Payment type saved!");

        });
    });

    // add event listener for viewExpenseBtn
        viewExpenseBtn.addEventListener("click", async () => {
            
            // clear mainDiv
            mainDiv.textContent = "";

            // setup from date entry
            const fromDiv = document.createElement("div");
            fromDiv.className = "dateDiv";
            const fromDateEntry = document.createElement("input");
            fromDateEntry.type = "date";
            fromDateEntry.id = "fromDate";
            fromDateEntry.value = new Date().toISOString().split("T")[0];
            fromDateEntry.className = "input";
            const fromLabel = document.createElement("label");
            fromLabel.innerHTML = "From: ";
            fromLabel.setAttribute("for", "fromDate");
            fromDiv.appendChild(fromLabel);
            fromDiv.appendChild(fromDateEntry);
            mainDiv.appendChild(fromDiv);

            // setup to date entry
            const toDiv = document.createElement("div");
            toDiv.className = "dateDiv";
            const toDateEntry = document.createElement("input");
            toDateEntry.type = "date";
            toDateEntry.id = "toDate";
            toDateEntry.value = new Date().toISOString().split("T")[0];
            toDateEntry.className = "input";
            const toLabel = document.createElement("label");
            toLabel.innerHTML = "To: ";
            toLabel.setAttribute("for", "toDate");
            toDiv.appendChild(toLabel);
            toDiv.appendChild(toDateEntry);
            mainDiv.appendChild(toDiv);

            // setup view button
            const viewBtn = document.createElement("button");
            viewBtn.textContent = "View";
            viewBtn.classList = "saveBtn";
            mainDiv.appendChild(viewBtn);

            // event listener for viewBtn
            viewBtn.addEventListener("click", async () => {
                viewBtn.innerHTML = "Wait...";
                viewBtn.disabled = true;
                const viewData = {
                    fromDate: fromDateEntry.value,
                    toDate: toDateEntry.value
                }
                            
                // send to backend
                const viewRes = await fetch("/api/viewExpenses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(viewData)
            });
            const expensesToView = await viewRes.json();
            viewBtn.innerHTML = "View";
            viewBtn.disabled = false;
            displayExpenses(expensesToView);

            });
        });

    // initialize the page
    addExpenseBtn.click();
});

// on 'login' button click
loginBtn.addEventListener("click", async () => {
    const inputEmail = document.getElementById("inputEmail").value;
    const inputPassword = document.getElementById("inputPassword").value;

    // call the backend js
    const loginRes = await fetch("/api/loginLogic", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ inputEmail, inputPassword })
    });

    // process the returned data
    const data = await loginRes.json();
    if (!loginRes.ok) {
        document.getElementById("loginError").textContent = data.error;
        return;
    }
    
    // save the date in local storage and reload page
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("userId", data.user.id);
    document.getElementById("loginModal").style.display = "none";
    location.reload();
});





    