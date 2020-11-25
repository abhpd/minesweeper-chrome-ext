export default function generateGrid(row, col, table_class) {
    console.log("test");
    let table = document.querySelector(table_class);

    for (let i = 0; i < row; i++) {
        let table_row = document.createElement("TR");
        for (let j = 0; j < col; j++) {
            let table_data = document.createElement("TD");

            let element = document.createElement("div");
            element.classList.add("cell");

            table_data.appendChild(element);

            table_row.appendChild(table_data);
        }
        table.appendChild(table_row);
    }
}
