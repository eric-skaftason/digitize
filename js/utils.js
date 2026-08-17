// Only works for flat objects
function objIsEqual(a, b) {
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export { objIsEqual };
