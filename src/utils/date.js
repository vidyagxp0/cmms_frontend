export const formatDate = (value, fallback = "-") => {
    if (!value) return fallback;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return fallback;

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

export const formatDateTime = (value, fallback = "-") => {
    if (!value) return fallback;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return fallback;

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", {
        month: "short",
    });
    const year = date.getFullYear();

    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    return `${day}-${month}-${year} ${time}`;
};