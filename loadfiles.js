import firebase from 'firebase/app'
import {element} from './createElement'


// Создание кнопки загрузки с сервера

export function load(myClass, database) {
    const container = document.querySelector('.card')
    const viewTable = element('div', myClass, 'Нет загруженных данных')
    const loader = document.querySelector('.loader')

    
    container.prepend(viewTable)
    console.log(viewTable)

    const  loadInHtml = (imgLink) => {
        imgLink.forEach(link => {
            console.log(link)
            const elImg = document.createElement('img')
            elImg.classList.add(['image'])
            elImg.setAttribute('src', link)
            viewTable.append(elImg)
        })
    }


    loader.addEventListener('click', () => {
        let imageLink = []
        const ref = firebase.database().ref('allImages')
        ref.on("value", snapshot => {
            imageLink = snapshot.val()
            if(imageLink.length) {
                viewTable.textContent = ''
            }
            loadInHtml(imageLink)
        }, function (error) {
            console.log("Error: " + error.code)
        })

    })



}