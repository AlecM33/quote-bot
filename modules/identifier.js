module.exports = () => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

    return colors[Math.floor(Math.random() * colors.length)] + Math.floor(Math.random() * 1000);
}
