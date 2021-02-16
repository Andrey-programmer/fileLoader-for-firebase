import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/database'
import {upload} from './upload'
import {load} from './loadfiles'    
import 'regenerator-runtime/runtime'


const firebaseConfig = {
    apiKey: "AIzaSyDfPu9MUFVaElFCn2MbHMPAqJCUWyI9IFU",
    authDomain: "upload-plugin-29338.firebaseapp.com",
    projectId: "upload-plugin-29338",
    storageBucket: "upload-plugin-29338.appspot.com",
    messagingSenderId: "1044784422849",
    appId: "1:1044784422849:web:e4a38cd276f4b849d49940"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

  const storage = firebase.storage()
  const database = firebase.database()
  console.log(database);
  console.log(storage)

upload('#file', {
    accept: ['.png', '.jpg', '.jpeg', '.gif'],
    onUpload(files, blocks) {
        // {
        //     let imageLinks = []
        //     const ref = firebase.database().ref('allImages')
        //     await ref.on("value", snapshot => {
        //             snapshot.val().map((x, index) => {
        //                 console.log(x) 
        //                 imageLinks[index] = x
        //             })
        //             console.log(imageLinks)
        //     }, function (error) {
        //         console.log("Error: " + error.code)
        //     })
        // }

        files.forEach((file, index) => {
            const ref = storage.ref(`images/${file.name}`) // Создаём референцию (путь)
            const task = ref.put(file) //Кладем туда сам файл
            // Прослушиваем событие загрузки
            task.on('state_changed', snapshot => {
                // Смотрим процент загрузки
                const percent = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
                // console.log(percent)
                const block = blocks[index].querySelector('.preview-info-progress')
                block.textContent = `${percent} %`
                block.style.width = `${percent}%`
            }, error => {
                console.log(error); 
            }, async () => {
                const url = await task.snapshot.ref.getDownloadURL()
                // Записываем путь в картинку
                var refData = firebase.database().ref(`allImages/${index}`).set(url)
            })
            
        })
    }
})

load(['view-table'], database)