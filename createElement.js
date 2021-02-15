export const element = (tag, classes = [], content) => {
    const node = document.createElement(tag)
    if(classes.length) {
        node.classList.add(...classes)
    }

    if(content) {
        node.textContent = content
    }

    return node
}
