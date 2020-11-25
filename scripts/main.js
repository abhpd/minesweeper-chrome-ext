//Max popup size = (h,w) = (600px, 800px)

//Global values
let row = 13;
let col = 10;

function resetHandler() {
    chrome.storage.sync.set({ timer: 0 });
    chrome.storage.sync.set({ mine_grid: [] });
    let old_table = document.querySelector(".land-grid");
    old_table.remove();

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

            chrome.storage.sync.get("mine_grid", function (result) {
                if (result.mine_grid) {
                    if (
                        result.mine_grid.find(
                            (ele) => ele[0] === i && ele[1] === j
                        )
                    ) {
                        element.classList.add("mine");
                    } else {
                        const mineCount = surroundMineCounter(
                            [i, j],
                            result.mine_grid
                        );
                        if (mineCount > 0) {
                            let count_text = document.createElement("H1");
                            count_text.innerHTML = mineCount;
                            element.appendChild(count_text);
                        }
                    }
                }
            });

            table_data.appendChild(element);

            table_row.appendChild(table_data);
        }
        table.appendChild(table_row);
    }
}

function mineLayer() {
    let mine_count = 30;
    let mine_grid = [];

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

    chrome.storage.sync.set({ mine_grid: mine_grid });
}

function surroundMineCounter(pos, mine_grid) {
    let total = 0;

    total = mine_grid.find(
        (ele) => ele[0] === pos[0] - 1 && ele[1] === pos[1] - 1
    ) //top-left
        ? total + 1
        : total;

    total = mine_grid.find((ele) => ele[0] === pos[0] - 1 && ele[1] === pos[1]) //top
        ? total + 1
        : total;

    total = mine_grid.find(
        (ele) => ele[0] === pos[0] - 1 && ele[1] === pos[1] + 1
    ) //top-right
        ? total + 1
        : total;

    total = mine_grid.find((ele) => ele[0] === pos[0] && ele[1] === pos[1] - 1) //left
        ? total + 1
        : total;

    total = mine_grid.find((ele) => ele[0] === pos[0] && ele[1] === pos[1] + 1) //right
        ? total + 1
        : total;

    total = mine_grid.find(
        (ele) => ele[0] === pos[0] + 1 && ele[1] === pos[1] - 1
    ) //bottom-left
        ? total + 1
        : total;

    total = mine_grid.find((ele) => ele[0] === pos[0] + 1 && ele[1] === pos[1]) //bottom
        ? total + 1
        : total;

    total = mine_grid.find(
        (ele) => ele[0] === pos[0] + 1 && ele[1] === pos[1] + 1
    ) //bottom-right
        ? total + 1
        : total;

    return total;
}

function setTimer(value) {
    document.querySelector(".timer-text").innerHTML = value;
}

function main() {
    generateGrid(".land-grid");
}

//Timer

chrome.storage.sync.get("timer", function (result) {
    setTimer(Number(result.timer));
    chrome.storage.sync.set({ timer: Number(result.timer) + 1 });
});

setInterval(() => {
    chrome.storage.sync.get("timer", function (result) {
        setTimer(Number(result.timer));
        chrome.storage.sync.set({ timer: Number(result.timer) + 1 });
    });
}, 1000);

document.onload = main();
