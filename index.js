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
window.addEventListener("load", async() => {
    const loginModal = document.getElementById("loginModal");
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const addExpenseBtn = document.createElement("button");
    const viewExpenseBtn = document.createElement("button");
    const editBtn = document.createElement("button");
    const headerDiv = document.getElementById("headerDiv");
    const mainDiv = document.getElementById("mainDiv");

    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "block";
        return;
    }
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
        amount.type = "text";
        amount.inputMode = "decimal";
        amount.step = "0.01";
        amount.min = "0";
        amount.placeholder = "$0.00";
        amount.className = "input";
        mainDiv.appendChild(amount);

        // setup notes
        const notes = document.createElement("input");
        notes.type = "text";
        notes.placeholder = "Add a note";
        notes.className = "input";
        mainDiv.appendChild(notes);

        // save button
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.classList = "saveBtn";
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
            addExpenseBtn.click();
            alert("Expense saved!");
        });
    });

    addExpenseBtn.click();
});

// on 'login' button click
document.getElementById("loginBtn").addEventListener("click", async () => {
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
    localStorage.setItem("userId", data.user.user_id);
    document.getElementById("loginModal").style.display = "none";
    location.reload();
});



    