import firebase from 'firebase/app'
import {element} from './createElement'

function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (!bytes) 
    {  
        return '0 Byte'
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

function noop() {

}



export function upload(selector, options = {
    
}) {

    let files = []
    const onUpload = options.onUpload ?? noop

    const input = document.querySelector(selector)
    const preview = element('div', ['preview'])
    const open = element('button', ['btn'], 'Открыть')
    const upload = element('button', ['btn', 'primary'], 'Загрузить на сервер')
    const load = element('button', ['btn', 'loader'], 'Загрузить с сервера')

    upload.style.display = 'none'

    if(options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }




    console.log(input)
    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', load)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', open)

    const triggerInput = () => {
        input.click()
    }

    const changeHandler = (event) => {
        if(!event.target.files.length) {
            return
        }

        // Получаем массив файлов 
        files = Array.from(event.target.files)
        preview.innerHTML = ''
        upload.style.display = 'inline'

        files.forEach(file => {
            if(!file.type.match('image')) {
                return
            }
            else {
                const reader = new FileReader()
                
                reader.onload = event => {
                    const src = event.target.result

                    preview.insertAdjacentHTML('afterbegin', 
                    `<div class="preview-image">
                        <div class="preview-remove" data-name="${file.name}">&times;</div>
                        <img    src="${src}" alt="${file.name}"/>
                        <div class="preview-info">
                            <span>${file.name}</span>
                            ${bytesToSize(file.size)}
                        </div>
                    </div>`)
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const removeHandler = event => {
        // console.log(event.target.dataset);
        if(!event.target.dataset.name) {
            return
        }

        const {name} = event.target.dataset

        files = files.filter(file => file.name !== name)



        const block = preview.querySelector(`[data-name="${name}"]`).closest('.preview-image')
        // console.log(block);
        block.classList.add('removing')

        setTimeout(() => {
            if(!files.length) {
                upload.style.display = 'none'
            }
            block.remove()
        }, 500) 


    }

    const uploadHandler = async event => {
        preview.querySelectorAll('.preview-remove').forEach(e => e.remove())
        const previewInfo = preview.querySelectorAll('.preview-info')
        previewInfo.forEach(el => {
            el.style.bottom = '4px'
            el.innerHTML = '<div class="preview-info-progress"></div>'
        })

        // второй вариант
        {
            const ref = firebase.database().ref('allImages')

            files.map(async file => {
                await ref.on("value", snapshot => {
                    snapshot.val().map((child, index) => {
                        if (child.indexOf(file.name) !== -1) {
                            console.log('FileName:', file.name)
                        } else {
                            // Удаляем массив имена из массива files если они уже были
                            const index = child.indexOf(file.name) 
                            console.log('=== del file.name = ', file.name)
                            files.splice(index, 1)
                            console.log(files)
                        }
                    })
                }, function (error) {
                        console.log("Error: " + error.code)
                })
            })
        }

        // Первый вариант
        // {
        //     let imageLinks = []

        //     const ref = firebase.database().ref('allImages')
        //     await ref.on("value", snapshot => {
        //             snapshot.val().map((x, index) => {
        //                 // console.log(x) 
        //                 imageLinks[index] = x
        //                 files = files.filter(file => {
        //                     if (x.indexOf(file.name) !== -1) {
        //                         console.log('FileName:', file.name)
        //                     }
        //                     // Удаляем массив имена из массива files если они уже были
        //                     return (x.indexOf(file.name) === -1)
        //                 })
        //                 console.log(files)
        //             })
        //     }, function (error) {
        //             console.log("Error: " + error.code)
        //     })
        // }

        
           
        onUpload(files, previewInfo)
    }

    
    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandler)
}