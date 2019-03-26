
// budget controller

var budgetController = (function(){

    var Expense = function(id, descr, val) {

        this.id = id;
        this.descr = descr;
        this.val = val;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
          this.percentage = Math.round((this.val/totalIncome) * 100);
        } else {
          this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, descr, val) {

        this.id = id;
        this.descr = descr;
        this.val = val;
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
          sum += current.val;
        });
        data.totals[type] = sum;
    };

    var data = {

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
      addItem: function(t, d, v){
          var newItem;
          // theloume id na einai to teleytaio id +1

          //Create new ID
          if (data.allItems[t].length > 0) {
            ID = data.allItems[t][data.allItems[t].length -1].id + 1;
          }
          else {
            ID = 0;
          }
          //Create new item analoga an exoume exp h inc
          if (t === 'exp'){
             newItem = new Expense(ID, d, v);
          } else if(t === 'inc'){
             newItem = new Income(ID, d, v);
          }
          // to vazoume sto data structure
          data.allItems[t].push(newItem);
          return newItem;
      },

      deleteItem: function(type, id) {

          var ids, index;
          ids = data.allItems[type].map(function(current){
              return current.id;
          });

          index = ids.indexOf(id);

          if (index !== -1) {
              data.allItems[type].splice(index, 1);
          }
      },

      calculateBudget: function() {

          // calcuate total income and expenses
          calculateTotal('exp');
          calculateTotal('inc');

          // calculate budget
          data.budget = data.totals.inc - data.totals.exp;

          //calculate the percentage of income spent if income >0
          if (data.totals.inc > 0) {
              data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
          } else {
              data.percentage = -1;
          }
      },

      calculatePercentage: function() {

          data.allItems.exp.forEach(function(current) {
              current.calcPercentage(data.totals.inc);
          });
      },

      getPercentage: function() {
          var allPercentage = data.allItems.exp.map(function(current){
              return current.getPercentage();
        });

          return allPercentage;
      },

      getBudget: function() {
        return {
          budget: data.budget,
          totIncome: data.totals.inc,
          totExpenses: data.totals.exp,
          per: data.percentage
        };
      },


      testing: function(){
        return data;
      }
    };
})();

// UI controller

var UIController = (function() {

     var DOMstrings = {
         inputType: '.add__type',
         inputDescription: '.add__description',
         inputValue: '.add__value',
         inputBtn: '.add__btn',
         incomeContainer:'.income__list',
         expensesContainer: '.expenses__list',
         budgetLabel: '.budget__value',
         incomeLabel: '.budget__income--value',
         expensesLabel: '.budget__expenses--value',
         percentageLabel: '.budget__expenses--percentage',
         container: '.container',
         expPercentageLabel: '.item__percentage',
         dateLabel: '.budget__title--month'
     };

     var nodeListForEach = function(list, callback){
         for (var i = 0; i < list.length; i++) {
             callback(list[i], i);
         }
     };

     return {
       getInput: function() {
         return {
           // store the values the user gives in variables
           // get if type it is a + or -, income or expense
           type: document.querySelector(DOMstrings.inputType).value,// will be inc or exp as we can see in the option tags
           // description of the transaction
           description: document.querySelector(DOMstrings.inputDescription).value,
           // amount of money of specific transaction
           value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
         };
       },

       addListItem: function(obj, type) {
         var html, newHtml,element;
          // create html string with placeholder
          if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descr%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%descr%</div><div class="right clearfix"><div class="item__value">%val%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
          }
          // replace the placeholder with data
          newHtml = html.replace('%id%', obj.id);
          newHtml = newHtml.replace('%descr%', obj.descr);
          newHtml = newHtml.replace('%val%', this.formatNumber(obj.val, type));
          // insert the html to the dom
          document.querySelector(element).insertAdjacentHTML('beforeEnd',newHtml);
       },

       deleteListItem: function(selectorID) {

          var el;
          el = document.getElementById(selectorID);
          el.parentNode.removeChild(el);
       },

       clearFields: function() {
          var fields, fieldsArray;

          fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

          fieldsArray = Array.prototype.slice.call(fields);

          fieldsArray.forEach(function(cur, ind, arr) {
              cur.value = "";
          });
          fieldsArray[0].focus();
       },

       displayBudget: function(obj) {
         var type;
         obj.budget > 0 ? type = 'inc' : type = 'exp';

         document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
         document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totIncome, 'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = this.formatNumber(obj.totExpenses, 'exp');


         if (obj.per > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.per + '%';
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
         }
       },

       displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                   current.textContent = percentages[index] + '%';
                } else {
                   current.textContent = '---';
                }

            })
       },

       formatNumber: function(num, type){
            var numSplit, integer, decimal;
            // 1. + or - before number
            // 2. 2 decimal points
            // 3. comma stis xiliades

            num = Math.abs(num);
            num = num.toFixed(2);

            numSplit = num.split('.');

            integer = numSplit[0];
            decimal = numSplit[1];

            if (integer.length > 3) {
               integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, integer.length);
            }

            return (type === 'exp' ?  '-' : '+') + ' ' + integer + '.' + decimal;

       },

       displayMonth: function(){
            var year, month, now, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
             'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
       },

       changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current){

                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

       },

       getDOMstrings: function() {
          return DOMstrings;
       }

     };
})();

// global app controller

var controller = (function(budgetCtrl, UICtrl){

    var setUpEventListeners = function() {

        var dom = UICtrl.getDOMstrings();

        document.querySelector(dom.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(dom.inputType).addEventListener('change', UICtrl.changedType);
      };

    var updateBudget = function() {
        var budget;
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2 . return budget
        budget = budgetCtrl.getBudget();

        // 3. Display Budget on UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentage = function(){

        var percentage;
        // 1. Calculate percentages
        budgetCtrl.calculatePercentage();

        // 2. Read percentages from budget budgetController
        percentage = budgetCtrl.getPercentage();

        // 3. Update the UI
        UICtrl.displayPercentages(percentage);

    }

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get input data
        var input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add new item to UI
            UICtrl.addListItem(newItem, input.type);

            // 3b. Clear the fields
            UICtrl.clearFields();

            // 4.Update budget
            updateBudget();

            // 5. Update percentages
            updatePercentage();
        }
    };

      var ctrlDeleteItem = function(event) {
          var itemID, splitID, type, ID;

          itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

          if (itemID) {

              splitID = itemID.split('-');
              type = splitID[0];
              ID = parseInt(splitID[1]);

              // 1. delete item from data structure
              budgetCtrl.deleteItem(type, ID);

              // 2. delete item from UI
              UICtrl.deleteListItem(itemID);

              // 3. update and show budget
              updateBudget();

              // 4. update percentage
              updatePercentage();
          }
      };

        return {
          init: function() {
            document.querySelector('.add__type'). value = 'inc';
            UICtrl.displayBudget({
              budget: 0,
              totIncome: 0,
              totExpenses: 0,
              per: -1
            });

            UICtrl.displayMonth();
            setUpEventListeners();
          }
        };
})(budgetController, UIController);

controller.init();
