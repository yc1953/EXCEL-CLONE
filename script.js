/* const ps = new PerfectScrollbar(".actual-data", {
    wheelSpeed: 2,
    wheelPropagation: true
}); */
for (let i = 1; i <= 100; i++) {
    let str = "";
    let n = i;
    while (n > 0) {
        let rem = n % 26;
        if (rem == 0) {
            str = "Z" + str;
            n = Math.floor(n / 26) - 1;
        }
        else {
            str = String.fromCharCode(rem - 1 + 65) + str;
            n = Math.floor(n / 26);
        }
    }
    $('.column-names').append(`<div class="col-name column-${i}" id="${str}">${str}</div>`);
}

for (let i = 1; i <= 100; i++) {
    $('.row-names').append(`<div class="row-number">${i}</div>`);
}

let data = {
    "Sheet1": {}
}

let selectedSheet = "Sheet1";
let totalSheets = 1;
let firstSelectedCell = [];
let saved = true;
let lastlyAddedSheet = 1;
let defaultProperties = {
    "font-family": "Noto Sans",
    "font-size": 14,
    "text": "",
    "bold": false,
    "italics": false,
    "underlined": false,
    "alignment": "left",
    "color": "#444",
    "bgcolor": "#fff",
    "formula": "",
    "upstream": [],
    "downstream": []
};

for (let i = 1; i <= 100; i++) {
    let row = $('<div class="cell-row"></div>');
    let rowArray = [];
    for (let j = 1; j <= 100; j++) {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
        /* rowArray.push({
            "font-family": "Noto Sans",
            "font-size": 14,
            "text": "",
            "bold": false,
            "italics": false,
            "underlined": false,
            "alignment": "left",
            "color": "#444",
            "bgcolor": "#fff"
        }); */
    }
    //data.push(rowArray);
    $(".actual-data").append(row);
}

$('.actual-data').scroll(function (e) {
    $('.column-names').scrollLeft(this.scrollLeft);
    $('.row-names').scrollTop(this.scrollTop);
});

$('.input-cell').dblclick(function (e) {
    $('.input-cell.selected').removeClass('selected topSelected bottomSelected leftSelected rightSelected');
    $(this).addClass('selected');
    $(this).attr('contenteditable', 'true');
    $(this).focus();
});

$('.input-cell').blur(function (e) {
    $(this).attr('contenteditable', 'false');
    updateCellData("text", $(this).text());
});

function getRowCol(ele) {
    let id = $(ele).attr('id');
    let row = parseInt(id.split('-')[1]);
    let col = parseInt(id.split('-')[3]);
    return [row, col];
}

$('.input-cell').click(function (e) {
    let [row, col] = getRowCol(this);
    let topCell = $(`#row-${row - 1}-col-${col}`);
    let leftCell = $(`#row-${row}-col-${col - 1}`);
    let bottomCell = $(`#row-${row + 1}-col-${col}`);
    let rightCell = $(`#row-${row}-col-${col + 1}`);
    if ($(this).hasClass('selected') && e.ctrlKey) {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
    else {
        selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
});

function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if ($(ele).attr('contenteditable') == "false") {
        if ($(ele).hasClass('topSelected')) {
            topCell.removeClass('bottomSelected');
        }

        if ($(ele).hasClass('bottomSelected')) {
            bottomCell.removeClass('topSelected');
        }

        if ($(ele).hasClass('leftSelected')) {
            leftCell.removeClass('rightSelected');
        }

        if ($(ele).hasClass('rightSelected')) {
            rightCell.removeClass('leftSelected');
        }
        $(ele).removeClass('selected topSelected bottomSelected leftSelected rightSelected');
    }
}

function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if (e.ctrlKey) {
        if (topCell != null && topCell.hasClass('selected')) {
            $(ele).addClass('topSelected');
            topCell.addClass('bottomSelected');
        }

        if (bottomCell != null && bottomCell.hasClass('selected')) {
            $(ele).addClass('bottomSelected');
            bottomCell.addClass('topSelected');
        }

        if (leftCell != null && leftCell.hasClass('selected')) {
            $(ele).addClass('leftSelected');
            leftCell.addClass('rightSelected');
        }

        if (rightCell != null && rightCell.hasClass('selected')) {
            $(ele).addClass('rightSelected');
            rightCell.addClass('leftSelected');
        }
    }

    else {
        $('.input-cell.selected').removeClass('selected topSelected bottomSelected leftSelected rightSelected');
    }
    $(ele).addClass('selected');
    changeHeader(getRowCol(ele));
}

function changeHeader([rowId, colId]) {
    //console.log(data);
    if (data[selectedSheet][rowId - 1] != undefined && data[selectedSheet][rowId - 1][colId - 1] != undefined) {
        let cellData = data[selectedSheet][rowId - 1][colId - 1];
        $('.alignment.selected').removeClass('selected');
        $(`.alignment[data-type=${cellData.alignment}]`).addClass('selected');
        if (cellData.bold) {
            $("#bold").addClass('selected');
        } else {
            $("#bold").removeClass('selected');
        }

        if (cellData.italics) {
            $("#italic").addClass('selected');
        } else {
            $("#italic").removeClass('selected');
        }

        if (cellData.underlined) {
            $("#underline").addClass('selected');
        } else {
            $("#underline").removeClass('selected');
        }
        $('#backgroundColor').css('border-bottom', `4px solid ${cellData.bgcolor}`);
        $('#color').css('border-bottom', `4px solid ${cellData.color}`);
        $("#font-family").val(cellData["font-family"]);
        $("#font-size").val(cellData["font-size"]);
        $('#font-family').css('font-family', cellData["font-family"]);
    }
    else {
        $('.alignment.selected').removeClass('selected');
        $(`.alignment[data-type=${defaultProperties.alignment}]`).addClass('selected');
        $("#bold").removeClass('selected');
        $("#italic").removeClass('selected');
        $("#underline").removeClass('selected');
        $('#backgroundColor').css('border-bottom', `4px solid #fff`);
        $('#color').css('border-bottom', `4px solid #444`);
        $("#font-family").val(defaultProperties["font-family"]);
        $("#font-size").val(defaultProperties["font-size"]);
    }
}


let startedCellSelected = false;
let startCell = {};
let endCell = {};
let rightScrollStarted = false;
let leftScrollStarted = false;
let bottomScrollStarted = false;
let topScrollStarted = false;
let rightScrollInterval;
let leftScrollInterval;
let bottomScrollInterval;
let topScrollInterval;

$('.input-cell').mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        if (!startedCellSelected) {
            let [rowId, colId] = getRowCol(this);
            startCell = { rowId: rowId, colId: colId };
            selectAllBetweenCells(startCell, startCell);
            startedCellSelected = true;
            $(".input-cell.selected").attr("contenteditable", "false");
        }
    }
    else {
        startedCellSelected = false;
    }
});

$('.input-cell').mouseenter(function (e) {
    if (e.buttons == 1) {
        if (e.pageX < $('.actual-data').width() - 5 && rightScrollStarted) {
            clearInterval(rightScrollInterval);
            rightScrollStarted = false;
        }
        if (e.pageX > 5 && leftScrollStarted) {
            clearInterval(leftScrollInterval);
            leftScrollStarted = false;
        }
        if (e.pageY < $('.actual-data').height() - 5 && bottomScrollStarted) {
            clearInterval(bottomScrollInterval);
            bottomScrollStarted = false;
        }
        if (e.pageY > 5 && topScrollStarted) {
            clearInterval(topScrollInterval);
            topScrollStarted = false;
        }
        let [rowId, colId] = getRowCol(this);
        endCell = { "rowId": rowId, "colId": colId };
        selectAllBetweenCells(startCell, endCell);
    }
});

function selectAllBetweenCells(startCell, endCell) {
    $('.input-cell.selected').removeClass('selected topSelected bottomSelected leftSelected rightSelected');
    for (let i = Math.min(startCell.rowId, endCell.rowId); i <= Math.max(startCell.rowId, endCell.rowId); i++) {
        for (let j = Math.min(startCell.colId, endCell.colId); j <= Math.max(startCell.colId, endCell.colId); j++) {
            let currCell = $(`#row-${i}-col-${j}`);
            let topCell = $(`#row-${i - 1}-col-${j}`);
            let bottomCell = $(`#row-${i + 1}-col-${j}`);
            let leftCell = $(`#row-${i}-col-${j - 1}`);
            let rightCell = $(`#row-${i}-col-${j + 1}`);
            // Giving 0th index for currCell because we are actually passing this object in selectCell function and then apply $(this) so the object of that selected cell is present at 0th index
            selectCell(currCell[0], { "ctrlKey": true }, topCell, bottomCell, leftCell, rightCell);
        }
    }
}
function scrollXR() {
    rightScrollStarted = true;
    rightScrollInterval = setInterval(function () {
        $('.actual-data').scrollLeft($('.actual-data').scrollLeft() + 100);
    }, 100);
};

function scrollXL() {
    leftScrollStarted = true;
    leftScrollInterval = setInterval(function () {
        $('.actual-data').scrollLeft($('.actual-data').scrollLeft() - 100);
    });
}

function scrollYB() {
    bottomScrollStarted = true;
    bottomScrollInterval = setInterval(function () {
        $('.actual-data').scrollTop($('.actual-data').scrollTop() + 100);
    });
}

function scrollYT() {
    topScrollStarted = true;
    topScrollInterval = setInterval(function () {
        $('.actual-data').scrollTop($('.actual-data').scrollTop() - 100);
    })
}

$('.data-container').mousemove(function (e) {
    e.preventDefault();
    if (e.buttons == 1) {
        if (e.pageX > $('.actual-data').width() - 5 && !rightScrollStarted) {
            scrollXR();
        }

        if (e.pageX < 5 && !leftScrollStarted) {
            scrollXL();
        }

        if (e.pageY > $('.actual-data').height() - 2 && !bottomScrollStarted) {
            scrollYB();
        }

        if (e.pageY < 2 && !topScrollStarted) {
            scrollYT();
        }
    }
})

$('.data-container').mouseup(function (e) {
    clearInterval(rightScrollInterval);
    clearInterval(leftScrollInterval);
    clearInterval(bottomScrollInterval);
    clearInterval(topScrollInterval);
    rightScrollStarted = false;
    leftScrollStarted = false;
    bottomScrollStarted = false;
    topScrollStarted = false;
});

$('.alignment').click(function (e) {
    let alignment = $(this).attr('data-type');
    $('.alignment.selected').removeClass('selected');
    $(this).addClass('selected');
    $('.input-cell.selected').css("text-align", alignment);
    /* $('.input-cell.selected').each(function (index, d) {
        let [rowId, colId] = getRowCol(d);
        data[rowId - 1][colId - 1].alignment = alignment;
    }); */
    updateCellData("alignment", alignment);
});

$('#bold').click(function () {
    setStyle(this, "bold", "font-weight", "bold");
});

$('#italic').click(function () {
    setStyle(this, "italics", "font-style", "italic");
});

$('#underline').click(function () {
    setStyle(this, "underlined", "text-decoration", "underline");
});

/* $('#backgroundColor').click(function() {
    setStyle(this, "bgcolor", "background-color")
}) */

function setStyle(ele, property, key, value) {
    if ($(ele).hasClass('selected')) {
        $(ele).removeClass("selected");
        $('.input-cell.selected').css(key, "");
        /* $('.input-cell.selected').each(function (index, d) {
            let [rowId, colId] = getRowCol(d);
            data[rowId - 1][colId - 1][property] = false;
        }); */
        updateCellData(property, false);
    }
    else {
        $(ele).addClass("selected");
        $('.input-cell.selected').css(key, value);
        /* $('.input-cell.selected').each(function (index, d) {
            let [rowId, colId] = getRowCol(d);
            data[rowId - 1][colId - 1][property] = true;
        }); */
        updateCellData(property, true);
    }
}

$(".color-pick").colorPick({
    'initialColor': '#yyabcd',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function () {
        //console.log(this.color);
        if (this.color != '#yyabcd') {
            if ($(this.element.children()[1]).attr("id") == 'backgroundColor') {
                $('.input-cell.selected').css('background-color', this.color);
                $('#backgroundColor').css('border-bottom', `4px solid ${this.color}`);
                /* $('.input-cell.selected').each((index, d) => {
                    let [rowId, colId] = getRowCol(d);
                    data[rowId - 1][colId - 1].bgcolor = this.color;
                }); */
                updateCellData("bgcolor", this.color);
            }
            else if ($(this.element.children()[1]).attr("id") == 'color') {
                $('.input-cell.selected').css('color', this.color);
                $('#color').css('border-bottom', `4px solid ${this.color}`);
                /* $('.input-cell.selected').each((index, d) => {
                    let [rowId, colId] = getRowCol(d);
                    data[rowId - 1][colId - 1]['color'] = this.color;
                }); */
                updateCellData("color", this.color);
            }
        }
    }
});

$('#backgroundColor').click(function () {
    setTimeout(() => {
        $(this).parent().click();
    }, 50);
});

$('#color').click(function () {
    setTimeout(() => {
        $(this).parent().click();
    }, 50);
});

$(".menu-selector").change(function (e) {
    let value = $(this).val();
    let id = $(this).attr("id");
    if (id == "font-family") {
        $("#font-family").css(id, value);
    }
    if (!isNaN(value)) {
        value = parseInt(value);
    }
    $('.input-cell.selected').css(id, value);
    /* $('.input-cell.selected').each((index, d) => {
        let [rowId, colId] = getRowCol(d);
        data[rowId - 1][colId - 1][id] = value;
    }); */
    updateCellData(id, value);
});

function updateCellData(property, value) {
    let currData = JSON.stringify(data);
    if (value != defaultProperties[property]) {
        $('.input-cell.selected').each(function (index, d) {
            let [rowId, colId] = getRowCol(d);
            if (data[selectedSheet][rowId - 1] == undefined) {
                data[selectedSheet][rowId - 1] = {};
                data[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upstream": [], "downstream": [] };
                data[selectedSheet][rowId - 1][colId - 1][property] = value;
            }
            else {
                if (data[selectedSheet][rowId - 1][colId - 1] == undefined) {
                    data[selectedSheet][rowId - 1][colId - 1] = { ...defaultProperties, "upstream": [], "downstream": [] };
                    data[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
                else {
                    data[selectedSheet][rowId - 1][colId - 1][property] = value;
                }
            }
        });
    }
    else {
        $('.input-cell.selected').each(function (index, d) {
            let [rowId, colId] = getRowCol(d);
            if (data[selectedSheet][rowId - 1] != undefined && data[selectedSheet][rowId - 1][colId - 1] != undefined) {
                data[selectedSheet][rowId - 1][colId - 1][property] = value;
                if (JSON.stringify(data[selectedSheet][rowId - 1][colId - 1]) == JSON.stringify(defaultProperties)) {
                    delete data[selectedSheet][rowId - 1][colId - 1];
                    if (Object.keys(data[selectedSheet][rowId - 1]).length == 0)
                        delete data[selectedSheet][rowId - 1];
                }
            }
        });
    }
    if (saved && currData != JSON.stringify(data)) {
        saved = false;
    }
}

$('.container').click(function (e) {
    $(".sheet-options-modal").remove();
});

function addSheetEvents() {
    $('.sheet-tab.selected').on("contextmenu", function (e) {
        e.preventDefault();
        selectSheet(this);
        $(".sheet-options-modal").remove();
        let modal = $(`<div class="sheet-options-modal">
                        <div class="option sheet-rename">Rename</div>
                        <div class="option sheet-delete">Delete</div>
                    </div>`);
        $(".container").append(modal);
        modal.css({ "left": e.pageX });
        $(".sheet-rename").click(function (e) {
            let renameModal = $(`<div class="sheet-modal-parent">
                                    <div class="sheet-rename-modal">
                                        <div class="sheet-modal-title">Rename Sheet</div>
                                        <div class="sheet-modal-input-container">
                                            <span class="sheet-modal-input-title">Rename Sheet to:</span>
                                            <input type="text" class="sheet-modal-input">
                                        </div>
                                        <div class="sheet-modal-confirmation">
                                            <button class="button yes-button">OK</button>
                                            <button class="button no-button">Cancel</button>
                                        </div>
                                    </div>
                                </div>`);
            $('.container').append(renameModal);
            $(".sheet-modal-input").focus();
            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
            });
            $(".yes-button").click(function (e) {
                renameSheet();
            });
            $(".sheet-modal-input").keypress(function (e) {
                if (e.key == "Enter")
                    renameSheet();
            });
        });

        $(".sheet-delete").click(function (e) {
            if (totalSheets > 1) {
                let deleteModal = `<div class="sheet-modal-parent">
                                        <div class="sheet-delete-modal">
                                            <div class="sheet-modal-title">${$('.sheet-tab.selected').text()}</div>
                                            <div class="sheet-modal-input-container">
                                                <span class="sheet-modal-input-title">Are you sure?</span>
                                            </div>
                                            <div class="sheet-modal-confirmation">
                                                <button class="button yes-button">Yes</button>
                                                <button class="button no-button">No</button>
                                            </div>
                                        </div>
                                    </div>`;
                $('.container').append(deleteModal);
                $(".no-button").click(function (e) {
                    $(".sheet-modal-parent").remove();
                });
                $(".yes-button").click(function (e) {
                    deleteSheet();
                });
            }
            else {
                alert("Only single sheet");
            }
        })
    });

    $('.sheet-tab.selected').click(function (e) {
        selectSheet(this);
    })
}

addSheetEvents();

$(".add-sheet").click(function (e) {
    lastlyAddedSheet++;
    totalSheets++;
    data[`Sheet${lastlyAddedSheet}`] = {};
    $(".sheet-tab.selected").removeClass("selected");
    $(".sheet-tab-container").append(`<div class="sheet-tab selected">Sheet${lastlyAddedSheet}</div>`);
    selectSheet();
    addSheetEvents();
    saved = false;
})

function selectSheet(ele) {
    if (ele && !$(ele).hasClass("selected")) {
        $(".sheet-tab.selected").removeClass("selected");
        $(ele).addClass("selected");
    }
    //* Empty the cells of the previous sheet
    emptyPreviousSheet();
    selectedSheet = $(".sheet-tab.selected").text();
    loadCurrentSheet();
    $('#row-1-col-1').click();
    $('.sheet-tab.selected')[0].scrollIntoView();
}

function emptyPreviousSheet() {
    let cellData = data[selectedSheet];
    let rowKeys = Object.keys(cellData);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(cellData[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text("");
            cell.css({
                "font-family": "Noto Sans",
                "font-size": 14,
                "font-weight": "",
                "font-style": "none",
                "text-decoration": "none",
                "text-align": "left",
                "color": "#444",
                "background-color": "#fff"
            });
        }
    }
}

function loadCurrentSheet() {
    let cellData = data[selectedSheet];
    let rowKeys = Object.keys(cellData);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(cellData[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`);
            cell.text(cellData[rowId][colId].text);
            cell.css({
                "font-family": cellData[rowId][colId]["font-family"],
                "font-size": cellData[rowId][colId]["font-size"],
                "font-weight": cellData[rowId][colId]["bold"] ? "bold" : "",
                "font-style": cellData[rowId][colId]["italics"] ? "italic" : "",
                "text-decoration": cellData[rowId][colId]["underlined"] ? "underline" : "",
                "text-align": cellData[rowId][colId]["alignment"],
                "color": cellData[rowId][colId]["color"],
                "background-color": cellData[rowId][colId]["bgcolor"]
            });
        }
    }
}

function renameSheet() {
    let newSheetName = $(".sheet-modal-input").val();
    if (newSheetName && !Object.keys(data).includes(newSheetName)) {
        let newData = {};
        for (let j of Object.keys(data)) {
            if (j == selectedSheet) {
                newData[newSheetName] = data[selectedSheet];
            } else {
                newData[j] = data[j];
            }
        }
        data = newData;
        selectedSheet = newSheetName;
        $(".sheet-tab.selected").text(newSheetName);
        $(".sheet-modal-parent").remove();
        saved = false;
    } else {
        $(".rename-error").remove();
        $(".sheet-modal-input-container").append(
            `<div class="rename-error">
                Sheet Name is not valid or sheet already exists
            </div>`
        );
    }
}

function deleteSheet() {
    $(".sheet-modal-parent").remove();
    let sheetIndex = Object.keys(data).indexOf(selectedSheet);
    let currSelectedSheet = $('.sheet-tab.selected');
    //delete data[selectedSheet];
    if (sheetIndex == 0) {
        selectSheet(currSelectedSheet.next()[0]);
    } else {
        selectSheet(currSelectedSheet.prev()[0]);
    }
    delete data[currSelectedSheet.text()];
    currSelectedSheet.remove();
    totalSheets--;
}

$(".left-scroller").click(function (e) {
    let keysArray = Object.keys(data);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    let currSelectedSheet = $('.sheet-tab.selected');
    if (selectedSheetIndex != 0) {
        selectSheet(currSelectedSheet.prev()[0]);
        $('.sheet-tab.selected')[0].scrollIntoView();
    }
});

$(".right-scroller").click(function (e) {
    let keysArray = Object.keys(data);
    let selectedSheetIndex = keysArray.indexOf(selectedSheet);
    let currSelectedSheet = $('.sheet-tab.selected');
    if (selectedSheetIndex != keysArray.length - 1) {
        selectSheet(currSelectedSheet.next()[0]);
        $('.sheet-tab.selected')[0].scrollIntoView();
    }
});

$('.file-btn').click(function (e) {
    let saveModal = $(`<div class="save-modal">
                            <div class="left-side-save-modal">
                                <div class="close-btn">
                                    <span class="material-icons close-icon icon outlined">
                                        arrow_back
                                    </span>
                                    Close
                                </div>
                                <div class="save-options">
                                    <div class="save-btns new-btn">
                                        <span class="material-icons icon outlined">
                                            add
                                        </span>
                                        New
                                    </div>
                                    <div class="save-btns open-btn">
                                        <span class="material-icons icon outlined">
                                            description
                                        </span>
                                        Open
                                    </div>
                                    <div class="save-btns save-btn">
                                        <span class="material-icons icon outlined">
                                            save
                                        </span>
                                        Save
                                    </div>
                                </div>
                            </div>
                            <div class="right-side-save-modal">

                            </div>
                            <div class="transparent-div"></div>
                        </div>`);
    $('.container').append(saveModal);



    $('.close-btn, .transparent-div').click(function (e) {
        $('.save-modal').remove();
    });

    $('.new-btn').click(function (e) {
        if (saved) {
            openNewFile();
        } else {
            let saveConfirmModal = $(`<div class="sheet-modal-parent">
                                        <div class="sheet-delete-modal">
                                            <div class="sheet-modal-title">${$('.title').text()}</div>
                                            <div class="sheet-modal-input-container">
                                                <span class="sheet-modal-input-title">Do you want to save?</span>
                                            </div>
                                            <div class="sheet-modal-confirmation">
                                                <button class="button yes-button">Yes</button>
                                                <button class="button no-button">No</button>
                                            </div>
                                        </div>
                                    </div>`);
            $('.save-modal').remove();
            $('.container').append(saveConfirmModal);
            $(".no-button").click(function (e) {
                $(".sheet-modal-parent").remove();
                openNewFile();
            });
            $(".yes-button").click(function (e) {
                // Save Function
                $(".sheet-modal-parent").remove();
                saveFile(true);
                //openNewFile();
            });
        }
    });



    $('.save-btn').click(function (e) {
        $('.save-modal').remove();
        saveFile();
    });

    $('.open-btn').click(function (e) {
        $('.save-modal').remove();
        appendOpenFileModal();
    });
});

function openNewFile() {
    emptyPreviousSheet();
    data = { "Sheet1": {} };
    $('.sheet-tab').remove();
    $('.sheet-tab-container').append(`<div class="sheet-tab selected">Sheet1</div>`);
    addSheetEvents();
    selectedSheet = "Sheet1";
    totalSheets = 1;
    $('.title').text('Excel - Book');
    $('#row-1-col-1').click();
}

function saveFile(newClicked) {
    $('.container').append(`<div class="sheet-modal-parent">
                                <div class="sheet-rename-modal">
                                    <div class="sheet-modal-title">Save File</div>
                                    <div class="sheet-modal-input-container">
                                        <span class="sheet-modal-input-title">Save File to:</span>
                                        <input type="text" value=${$('.title').text()} class="sheet-modal-input">
                                    </div>
                                    <div class="sheet-modal-confirmation">
                                        <button class="button yes-button">OK</button>
                                        <button class="button no-button">Cancel</button>
                                    </div>
                                </div>
                            </div>`);
    $('.no-button').click(function (e) {
        $('.sheet-modal-parent').remove();
        if (newClicked)
            openNewFile();
    })

    $('.yes-button').click(function (e) {
        $('.sheet-modal-parent').remove();
        let anchorTag = $(`<a href='data:application/json,${encodeURIComponent(JSON.stringify(data))}' download='Excel.json'></a>`);
        console.log(data);
        $('.container').append(anchorTag);
        anchorTag[0].click();
        if (newClicked)
            openNewFile();
    });
}

function appendOpenFileModal() {
    //* In this accept attribute we specigy MIM Type of the file
    let inputFile = $(`<input accept="application/json" type="File" />`);
    //$('.container').append(inputFile);
    inputFile.click();
    inputFile.change(function (e) {
        let file = e.target.files[0];
        console.log(file);
        $(".title").text(file.name.split(".json")[0]);
        let reader = new FileReader();
        reader.readAsText(file);

        //* This function executes when file reading is complete
        reader.onload = () => {
            emptyPreviousSheet();
            $(`.sheet-tab`).remove();
            data = JSON.parse(reader.result);
            let sheets = Object.keys(data);
            lastlyAddedSheet = 1;
            for (let i of sheets) {
                if (i.includes("Sheet")) {
                    let splittedSheetArray = i.split("Sheet");
                    if (splittedSheetArray.length == 2 && !isNaN(splittedSheetArray[1])) {
                        lastlyAddedSheet = parseInt(splittedSheetArray[1]);
                    }
                }
                $(".sheet-tab-container").append(`<div class="sheet-tab selected">${i}</div>`);
            }
            addSheetEvents();
            $(".sheet-tab").removeClass("selected");
            $($('.sheet-tab')[0]).addClass('selected');
            selectedSheet = sheets[0];
            totalSheets = sheets.length;
            lastlyAddedSheet = totalSheets;
            loadCurrentSheet();
        }
    });
    //inputFile.remove();
}

let clipboard = { startCell: [], data: {} };
let contentCutted = false;
$('.copy-btn,.cut-btn').click(function (e) {
    if ($(this).text() == "content_cut") {
        contentCutted = true;
    }
    clipboard = { startCell: [], data: {} };
    if ($(".input-cell.selected").length > 0) {
        clipboard.startCell = getRowCol($(".input-cell.selected")[0]);
        $(".input-cell.selected").each(function (index, d) {
            let [rowId, colId] = getRowCol(d);
            if (data[selectedSheet][rowId - 1] && data[selectedSheet][rowId - 1][colId - 1]) {
                if (!clipboard.data[rowId]) {
                    clipboard.data[rowId] = {};
                }
                clipboard.data[rowId][colId] = { ...data[selectedSheet][rowId - 1][colId - 1] };
            }
        });
    }
});

$('.paste-btn').click(function (e) {
    //* First we will empty the entire sheet
    //* And in end we use loadCurrentSheet()
    //* Therefore we will first empty the entire sheet and in end load the entire sheet
    //* because loadcurrentsheet only fills the sheet. it never delete content.
    if (contentCutted) {
        emptyPreviousSheet();
    }

    if ($(".input-cell.selected").length > 0) {
        let [pasteStartCellRow, pasteStartCellCol] = getRowCol($(".input-cell.selected")[0]);
        let clipboardStartCell = clipboard.startCell;
        let dataOfClipboard = clipboard.data;
        let rowkeys = Object.keys(dataOfClipboard);
        for (let rows of rowkeys) {
            let colkeys = Object.keys(dataOfClipboard[rows]);
            let rowId = parseInt(rows);
            for (let cols of colkeys) {
                let colId = parseInt(cols);
                if (contentCutted) {
                    delete data[selectedSheet][rowId - 1][colId - 1];
                    if (Object.keys(data[selectedSheet][rowId - 1]).length == 0)
                        delete data[selectedSheet][rowId - 1];
                }

            }
        }

        for (let rows of rowkeys) {
            let colkeys = Object.keys(dataOfClipboard[rows]);
            let rowId = parseInt(rows);
            for (let cols of colkeys) {
                let colId = parseInt(cols);


                let rowDiff = rowId - parseInt(clipboardStartCell[0]);
                let colDiff = colId - parseInt(clipboardStartCell[1]);
                if (!data[selectedSheet][pasteStartCellRow + rowDiff - 1]) {
                    data[selectedSheet][pasteStartCellRow + rowDiff - 1] = {};
                }
                data[selectedSheet][pasteStartCellRow + rowDiff - 1][pasteStartCellCol + colDiff - 1] = dataOfClipboard[rowId][colId];
            }
        }
        loadCurrentSheet();
        if (contentCutted) {
            contentCutted = false;
            clipboard = { startCell: [], data: {} };
        }
    }
});