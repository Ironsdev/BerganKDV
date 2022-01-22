/*
Blake Irons
Code Assessment, BerganKDV

I used VS Codium as an editor, and Brave browser with the built-in code inspection tool for debugging.
I opted to use javascript, html, and css sheets as my code scaled.
Also, I decided to leverage bootstrap for a quick & easy UI solution.  
Questions #1-4 are addressed in the code below.
I have 4 separate functions which address each question respectively. 
These functions could be condensed down. 

1. See function createArray1()
    Hardcoded cycle count considering lastCycleCount & daysBetweenCounts I simply added the daysBetween counts as days to the lastCycleCount date. 

2. See function createArray2()

3. See function createValue1()
    Taking into consideration warehouse 2 and 3 have item1, iPad 25GBs, I looked at the onhand, onorder, and sold values. 
    Warehouse 3 also has an undefined amount onhand. In production I would clarify this value with the warehouse and update as this value
    is needed to determine how many items would need to be ordered. For the sake of this demonstration, I will interpret the undefined value as the warehouse having 0 on hand. 

4. See function createChart1()
    Looking at the rate of demand growth for item 2, Macbook M1. I observed a monthly compounding growth of 50%. Growing each month by 50%, 100%, etc...
    Using this trend, if it holds for Quarter 2, I predict a 150%, 200%, 250% increase in demand for the following months. 

*/

    var inventoryItems = [
        { internalid: 1, itemName: "iPad 25GB", itemCode: "ipad25gb", lastCycleCount: "9/1/2021", daysBetweenCounts: 90},
        { internalid: 2, itemName: "MacBook M1", itemCode: "macbookm1", lastCycleCount: "12/31/2021", daysBetweenCounts: 60},
        { internalid: 3, itemName: "iPhone 500GB", itemCode: "iphone500gb", lastCycleCount: "1/1/2022", daysBetweenCounts: 90 },
    ];

    var inventoryLocation = [
        { warehouse: 2, item: 1, onhand: 3, onorder: 10, sold: 5 },
        { warehouse: 3, item: 1, onhand: undefined, onorder: 0, sold: 5 },
        { warehouse: 5, item: 2, onhand: 0, onorder: 10, sold: 7 },
    ];

    var warehouses = [
        { internalid: 1, parent: null, name: "US West" },
        { internalid: 2, parent: 1, name: "Washington" },
        { internalid: 3, parent: 1, name: "California" },
        { internalid: 4, parent: null, name: "US East" },
        { internalid: 5, parent: 4, name: "Boston" },
    ];

    var expectedDemand = [
        {
            item: 1,
            monthlyDemand: {
                jan: 100,
                feb: 80,
                mar: 60
            }
        },
        {
            item: 2,
            monthlyDemand: {
                jan: 100,
                feb: 150,
                mar: 300
            }
        }
    ];

    //used to add days to javascript date
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    //takes array of objects and returns an array containing a 2d array body and array header
    //adds next cycle count to inventoryItems 
    //used to create a table with inventory items data
    function createArray1(arr) {
        let arrBody = new Array();

        //parses inventoryItems and adds nextCycleCount by adding daysBetweenCounts to the last Cycle
        for(obj of arr) {
            let d = new Date(obj.lastCycleCount).addDays(obj.daysBetweenCounts);
            obj.nextCycleCount = d.toLocaleDateString('en-US');
        }

        let arrHead = Object.keys(arr[0]).filter(x => x!='internalid');//creates header from object keys, removes internal ids

        //creates body data, removes internal id
        arr.forEach(function(data){
            let arrRow = new Array();

            for(let [key, value] of Object.entries(data)) {
                if(key === 'internalid') continue;
                arrRow.push(value)
            }
            arrBody.push(arrRow)
        })
        return [arrBody, arrHead]
    }
    
    //returns an array containing a 2d array body and array header
    //generates header using warehouse names, generates body comparing all 3 tables, looking for availability.
    //could be condensed using filter,find.
    function createArray2() {
        let aHead = ["Item Name"];

        for(let wh of warehouses) {
            aHead.push(wh.name + " " + "Availability")
        }

        //Generates a 2d array, aBody, to create a table.
        let aBody = new Array();

        for(let i of inventoryItems) {
            let row = new Array();
            row.push(i.itemName)
        
            for(let j of warehouses) {
                let availability = 0; //default value if no item available

                //checks for hit, changes default value from 0
                for(let k of inventoryLocation) {
                    if(k.warehouse === j.internalid && k.item === i.internalid) {
                        availability = k.onhand - k.sold
                    }                            
                }
                row.push(availability) 
            }
            aBody.push(row)
        }
        return [aBody, aHead]
    }

    //Uses inventoryLocation var and gets an item number, and amount to customer wishes to purchase
    //writes the amount needed, amount = availability + onorder amount to DOM
    function createValue1() {
        let returnValue = 0;
        let item_num = Number(document.getElementById('item').value)
        let item_amount = document.getElementById('amount').value

        //generates amount 
        inventoryLocation.forEach(function(data){
            if(data.item === item_num) {
                let temp = (data.onhand || 0) - (data.sold || 0) + (data.onorder || 0);
                returnValue = returnValue + temp;
            }
        })
        //value needed to be ordered
        document.getElementById("amountOut").value = (item_amount - returnValue); //data is the elemen
    }

    //takes an item num, parses expected Demand var and outputs to chart
    function createChart1(item_num) {
        let demandArr = new Array(); //gets demand in array format to parse later
        let growthArr = new Array(); //growth for each month to calculate growth overall

        //gets array of values from expectedDemand
        expectedDemand.forEach(function(data){
            if(data.item === item_num) {
                demandArr = Object.values(data.monthlyDemand);
            }
        })

        //gets array of monthly growth values
        for(let i=0; i < demandArr.length-1; i++){
            let amount = (demandArr[i+1] - demandArr[i]) / demandArr[i]
            growthArr.push(amount)
        }

        let compoundGrowth = growthArr[1] - growthArr[0] //compounding growth each month

        //calcs next months demand using(2nd mo - 1st mo / 1st mo)
        //number of months is exit condition.
        let months = 3;
        while(months != 0){
            let growthPercent = growthArr[growthArr.length-1] + compoundGrowth
            let e = demandArr[demandArr.length-1] * growthPercent

            //pushes values to update arrays for successive growth
            growthArr.push(growthPercent)
            demandArr.push(e)
    
            months--;
        }

        //generates chart
        let dataSet = anychart.data.set(demandArr.slice(-3));
        var seriesData = dataSet.mapAs({ x: 0, value: 1 });
        let chart = anychart.line();
        let lineChart = chart.line(seriesData);
        lineChart.name("Demand")


        chart.title('Projected Quarter 2 demand of Macbook M1');
        chart.yAxis().title('# of Units');
        chart.container('myChart');
        chart.draw();

    }
    
    //takes an array of arrays and generates a table using the DOM
    //also takes a div id to append table to 
    //run onload 
    function createTable(tableData, divID) {
        let table = document.createElement('table');
        let tableBody = document.createElement('tbody');
        let tableHead = document.createElement('thead');

        //header
        let hrow = document.createElement('tr')
        tableData[1].forEach(function(cellData) {            
            let cell = document.createElement('th')
            cell.appendChild(document.createTextNode(cellData));
            hrow.appendChild(cell);
        });
        tableHead.appendChild(hrow)
        table.appendChild(tableHead)

        //body
        tableData[0].forEach(function(rowData) {
            let row = document.createElement('tr');

            rowData.forEach(function(cellData) {
            let cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });
        table.appendChild(tableBody);
        
        div = document.getElementById(divID);
        div.appendChild(table);
        
    }

    //onload function
    function start() {
        let td = createArray2();
        let td2 = createArray1(inventoryItems);
        createTable(td, 'availability');
        createTable(td2, 'items');
        createChart1(2)
    }
