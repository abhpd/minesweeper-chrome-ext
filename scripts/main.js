//Max popup size = (h,w) = (600px, 800px)

//delayer
function delay(delayInms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(1);
        }, delayInms);
    });
}

//Global values
const row = 13;
const col = 10;
let default_mine_count = 15;
let autoMiner = true;

chrome.storage.local.get("mineCount", (result) => {
    if (result.mineCount) {
        default_mine_count = result.mineCount;
    }
});

chrome.storage.local.get("autoMiner", (result) => {
    if (result.autoMiner) {
        autoMiner = result.autoMiner;
    }
});

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
    if (old_land_curtain) {
        old_land_curtain.remove();
    }

    let parent_grid = document.getElementById("parent-grid");

    let new_land_curtain = document.createElement("TABLE");
    new_land_curtain.classList.add("land-curtain");
    parent_grid.appendChild(new_land_curtain);

    generateCurtain(".land-curtain");
}

function resetHandler() {
    chrome.storage.local.get("mineCount", (result) => {
        if (result.mineCount) {
            default_mine_count = result.mineCount;
        }
    });

    chrome.storage.local.get("autoMiner", (result) => {
        if (result.autoMiner) {
            autoMiner = result.autoMiner;
        }
    });

    chrome.storage.local.set({ gameRunning: true });
    chrome.storage.local.set({ score: 0 });
    chrome.storage.local.get("score", (result) => {
        setScore(result.score);
    });

    chrome.storage.local.set({ timer: 0 });
    chrome.storage.local.set({ mine_grid: [] });
    chrome.storage.local.set({ clicked_grid: [] });
    chrome.storage.local.set({ flag_grid: [] });

    mineLayer();
    refreshGrid();
    refreshCurtain();
}

async function gameEndAndReveal() {
    setButtonEmoji("😭");
    chrome.storage.local.set({ gameRunning: false });
    let old_land_curtain = document.querySelector(".land-curtain");
    old_land_curtain.remove();
}

function setButtonEmoji(emoji) {
    document.getElementById("emoji").innerHTML = emoji;
}

//Event listners
document.getElementById("reset-button").addEventListener("click", () => {
    setButtonEmoji("😄");
    resetHandler();
});

document
    .getElementById("settings-button")
    .addEventListener("click", (event) => {
        event.target.innerHTML = event.target.innerHTML === "⨯" ? "⚙" : "⨯";

        chrome.storage.local.get("mineCount", (result) => {
            document.getElementById("mines-count-input").value =
                result.mineCount;
        });

        chrome.storage.local.get("mineCount", (result) => {
            if (result.mineCount) {
                document
                    .getElementById("auto-miner-input")
                    .setAttribute("checked", "");
            }
        });

        const change_defaults = document.getElementById("change-defaults");
        change_defaults.classList.toggle("hide-block-css");
    });

document
    .getElementById("change-defaults-submit")
    .addEventListener("click", async () => {
        let newMines = document.getElementById("mines-count-input").value;
        const newAutoMiner = document.getElementById("auto-miner-input")
            .checked;

        console.log(newMines);
        console.log(newAutoMiner);

        newMines = newMines > 100 ? 100 : newMines;
        newMines = newMines < 5 ? 5 : newMines;

        chrome.storage.local.set({ mineCount: newMines });

        chrome.storage.local.get("mineCount", (result) => {
            if (result.mineCount) {
                default_mine_count = result.mineCount;
            }
        });

        chrome.storage.local.set({ autoMiner: newAutoMiner });

        await delay(50);
        resetHandler();

        document.getElementById("settings-button").click();
    });

function cellListener() {
    //Event Listner for the cells
    document.querySelectorAll(".curtain-cell").forEach((element) => {
        element.addEventListener("click", async (event) => {
            console.log(event.which);
            if (event.which === 3) {
                return;
            }
            const row = Number(event.target.getAttribute("data-row"));
            const col = Number(event.target.getAttribute("data-col"));

            let noRefresh = false;

            chrome.storage.local.get("mine_grid", (result) => {
                if (
                    result.mine_grid.find(
                        (ele) => ele[0] === row && ele[1] === col
                    )
                ) {
                    gameEndAndReveal();
                }
            });

            chrome.storage.local.get("clicked_grid", (result) => {
                if (
                    !result.clicked_grid.find(
                        (ele) => ele[0] === row && ele[1] === col
                    )
                ) {
                    chrome.storage.local.get("flag_grid", (flag_result) => {
                        if (
                            !flag_result.flag_grid.find(
                                (ele) => ele[0] === row && ele[1] === col
                            )
                        ) {
                            const new_clicked_grid_array = [
                                ...result.clicked_grid,
                                [row, col],
                            ];
                            chrome.storage.local.set({
                                clicked_grid: new_clicked_grid_array,
                            });
                            chrome.storage.local.set({
                                score: new_clicked_grid_array.length,
                            });
                        }
                    });
                }
            });
            await delay(0);

            chrome.storage.local.get("gameRunning", (result) => {
                if (result.gameRunning) {
                    refreshCurtain();
                }
            });

            chrome.storage.local.get("score", (result) => {
                setScore(result.score);
            });
        });

        element.addEventListener("contextmenu", async (event) => {
            event.preventDefault();

            const row = Number(event.target.getAttribute("data-row"));
            const col = Number(event.target.getAttribute("data-col"));

            chrome.storage.local.get("flag_grid", (result) => {
                if (
                    result.flag_grid.find(
                        (ele) => ele[0] === row && ele[1] === col
                    )
                ) {
                    let new_flag_grid_array = result.flag_grid;
                    console.table(new_flag_grid_array[1]);

                    for (var i = 0; i < new_flag_grid_array.length; i++) {
                        if (
                            JSON.stringify(new_flag_grid_array[i]) ===
                            JSON.stringify([row, col])
                        ) {
                            new_flag_grid_array.splice(i, 1);
                        }
                    }

                    chrome.storage.local.set({
                        flag_grid: new_flag_grid_array,
                    });
                } else {
                    const new_flag_grid_array = [
                        ...result.flag_grid,
                        [row, col],
                    ];
                    chrome.storage.local.set({
                        flag_grid: new_flag_grid_array,
                    });
                }
            });
            await delay(0);
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
            chrome.storage.local.get("flag_grid", (result) => {
                if (
                    result.flag_grid.find((ele) => ele[0] === i && ele[1] === j)
                ) {
                    element.classList.add("flag");
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
    let mine_count = default_mine_count;

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
    chrome.storage.local.get("gameRunning", (result) => {
        if (result.gameRunning) {
            document.querySelector(".timer-text").innerHTML = value;
        }
    });
}

function setScore(value) {
    document.querySelector(".score-text").innerHTML = value;
}
chrome.storage.local.get("score", function (result) {
    setScore(Number(result.score));
});

function main() {
    generateGrid(".land-grid");
    generateCurtain(".land-curtain");

    chrome.storage.local.get("gameRunning", (result) => {
        if (!result.gameRunning) {
            gameEndAndReveal();
        }
    });
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
