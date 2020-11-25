//Max popup size = (h,w) = (600px, 800px)

//Global values
let row = 13;
let col = 10;
let mine_grid = [];

function resetHandler() {
    let old_table = document.querySelector(".land-grid");
    old_table.remove();
    mine_grid = [];

    let parent_grid = document.getElementById("parent-grid");
    let new_table = document.createElement("TABLE");
    new_table.classList.add("land-grid");
    parent_grid.appendChild(new_table);

    mineLayer();
    generateGrid(".land-grid");
}

//Event listners
document.getElementById("reset-button").addEventListener("click", () => {
    resetHandler();
});

function generateGrid(table_class) {
    let table = document.querySelector(table_class);

    for (let i = 0; i < row; i++) {
        let table_row = document.createElement("TR");
        for (let j = 0; j < col; j++) {
            let table_data = document.createElement("TD");

            let element = document.createElement("div");
            element.classList.add("cell");

            if (mine_grid.find((ele) => ele[0] === i && ele[1] === j)) {
                element.classList.add("mine");
            }

            table_data.appendChild(element);

            table_row.appendChild(table_data);
        }
        table.appendChild(table_row);
    }
}

function mineLayer() {
    let mine_count = 30;
    while (mine_count) {
        rand_row = Math.floor(Math.random() * row);
        rand_col = Math.floor(Math.random() * col);

        if (
            mine_grid.find((ele) => ele[0] === rand_row && ele[1] === rand_col)
        ) {
            continue;
        } else {
            mine_grid.push([rand_row, rand_col]);
            mine_count--;
        }
    }
}

function setTimer(value) {
    document.querySelector(".timer-text").innerHTML = value;
}

function main() {
    mineLayer();
    generateGrid(".land-grid");
}

const isPlaying = true;

//Timer

chrome.storage.local.get("timer", function (result) {
    setTimer(Number(result.timer));
    chrome.storage.local.set({ timer: Number(result.timer) + 1 });
});

setInterval(() => {
    chrome.storage.local.get("timer", function (result) {
        setTimer(Number(result.timer));
        chrome.storage.local.set({ timer: Number(result.timer) + 1 });
    });
}, 1000);

document.onload = main();
