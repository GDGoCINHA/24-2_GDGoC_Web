const formatDate = (dateString) => {
    if (!dateString) return "정보없음";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "정보없음";
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // add later
    /*
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    */
    return `${year}/${month}/${day}`;
};

export {
    formatDate
};