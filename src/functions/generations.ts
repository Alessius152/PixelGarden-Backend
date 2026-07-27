

function generatePairKey(id1: number, id2: number): string {
    return (id1 < id2) ? `${id1}_${id2}` : `${id2}_${id1}`
}

export {
    generatePairKey,
}
