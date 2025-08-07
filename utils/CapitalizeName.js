export const CapitalizeName = (name) => {
    if (!name) return ""; // Handle null, undefined, or empty strings
    return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};
