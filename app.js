// DATA MODULE
const budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function (type) {
        let sum = 0;

        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,

        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Push it into our data structure 
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index
            // create an array that has the ids of all item
            ids = data.allItems[type].map(function (current) {
                return current.id;
            })
            // locate the element's position with id
            index = ids.indexOf(id);

            // remove element in the data structure at the found index position
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // calcualte total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            }
        },

        getPercentages: function () {
            let allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            return data;
        }
    }
})();

// UI MODULE
const UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.expenses__list .item__percentage',
        dateLabel: '.budget__title--month'
    }

    function formatNumber(unformattedNum, type) {
        let formattedNum;

        // stripping off the sign
        formattedNum = Math.abs(unformattedNum);

        // return a comma-formatted number
        formattedNum = formattedNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return (type === 'exp' ? '-' : '+') + ' ' + formattedNum;
    }

    function nodeListForEach(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = document.querySelector(DOMStrings.incomeContainer);

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = document.querySelector(DOMStrings.expensesContainer);

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            element.insertAdjacentHTML('beforeend', newHtml);
        },


        deleteListItem: function (selectorID) {
            // remove the selected element
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            let fieldsList, fieldsArr;
            fieldsList = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // a shallow copy of list
            fieldsArr = Array.prototype.slice.call(fieldsList);

            fieldsArr.forEach(function (elem) {
                elem.value = '';
            })

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function (percentages) {
            let fields, nodeListForEach;

            fields = document.querySelectorAll(DOMStrings.expensePercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })
        },

        displayMonth: function () {
            let now, months, year, month;

            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            month = months[now.getMonth()];

            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function () {
            let fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            )

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMStrings.inputButton).classList.toggle('red')
        },

        getDOMStrings: function () {
            return DOMStrings;
        }
    }
})();

// CONTROLLER MODULE
const controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            // if "enter" is pressed
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    const updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget 
        let budget = budgetCtrl.getBudget()

        // 3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
    }

    const updatePercentages = function () {
        let percentages;
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    const ctrlAddItem = function () {
        let input, newItem;

        // 1. Get the input data (type, description, value)
        input = UICtrl.getInput();

        // Validate the input 
        if (input.description !== '' && !(input.value !== input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    const ctrlDeleteItem = function (event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data strcuture
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started.')
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();