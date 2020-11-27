//Max popup size = (h,w) = (600px, 800px)

//Global values
let row = 13;
let col = 10;

function refreshGrid() {
    let old_land_grid = document.querySelector(".land-grid");
    old_land_grid.remove();

    let parent_grid = document.getElementById("parent-grid");

    let new_land_grid = document.createElement("TABLE");
    new_land_grid.classList.add("land-grid");
    parent_grid.appendChild(new_land_grid);

    generateGrid(".land-grid");
}

function refreshCurtain() {
    let old_land_curtain = document.querySelector(".land-curtain");
    old_land_curtain.remove();

    let parent_grid = document.getElementById("parent-grid");

    let new_land_curtain = document.createElement("TABLE");
    new_land_curtain.classList.add("land-curtain");
    parent_grid.appendChild(new_land_curtain);

    generateCurtain(".land-curtain");
}

function resetHandler() {
    chrome.storage.local.set({ timer: 0 });
    chrome.storage.local.set({ mine_grid: [] });
    chrome.storage.local.set({ clicked_grid: [] });

    mineLayer();
    refreshGrid();
    refreshCurtain();
}

//Event listners
document.getElementById("reset-button").addEventListener("click", () => {
    resetHandler();
});

function cellListener() {
    //Event Listner for the cells
    document.querySelectorAll(".curtain-cell").forEach((element) => {
        element.addEventListener("click", (event) => {
            console.log(
                `${event.target.getAttribute(
                    "data-row"
                )},${event.target.getAttribute("data-col")}`
            );
            const row = Number(event.target.getAttribute("data-row"));
            const col = Number(event.target.getAttribute("data-col"));

            chrome.storage.local.get("clicked_grid", (result) => {
                if (
                    !result.clicked_grid.find(
                        (ele) => ele[0] === row && ele[1] === col
                    )
                ) {
                    chrome.storage.local.set({
                        clicked_grid: [...result.clicked_grid, [row, col]],
                    });
                }
            });
            refreshCurtain();
        });
    });
}

function generateGrid(table_class) {
    let table = document.querySelector(table_class);

    for (let i = 0; i < row; i++) {
        let table_row = document.createElement("TR");
        for (let j = 0; j < col; j++) {
            let table_data = document.createElement("TD");

            let element = document.createElement("div");
            element.classList.add("cell");
            element.setAttribute("data-row", `${i}`);
            element.setAttribute("data-col", `${j}`);

            chrome.storage.local.get("mine_grid", function (result) {
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
                            count_text.setAttribute("data-row", `${i}`);
                            count_text.setAttribute("data-col", `${j}`);
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

function generateCurtain(table_class) {
    let table = document.querySelector(table_class);

    for (let i = 0; i < row; i++) {
        let table_row = document.createElement("TR");
        for (let j = 0; j < col; j++) {
            let table_data = document.createElement("TD");

            let element = document.createElement("div");
            element.classList.add("curtain-cell");
            element.setAttribute("data-row", `${i}`);
            element.setAttribute("data-col", `${j}`);

            chrome.storage.local.get("clicked_grid", (result) => {
                if (
                    result.clicked_grid.find(
                        (ele) => ele[0] === i && ele[1] === j
                    )
                ) {
                    element.classList.add("transparent");
                }
            });

            table_data.appendChild(element);

            table_row.appendChild(table_data);
        }
        table.appendChild(table_row);
    }
    cellListener();
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

    chrome.storage.local.set({ mine_grid: mine_grid });
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
    generateCurtain(".land-curtain");
}

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
