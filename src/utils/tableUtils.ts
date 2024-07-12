import { getBorderCharacters } from "table"

export const borderlessTable = {
    border: getBorderCharacters('void'),
    columnDefault: {
        paddingLeft: 0,
        paddingRight: 1,
    },
    columns: [{ width: 20 }, { width: 50 }],
    drawHorizontalLine: () => false,
}
