let menug = document.querySelector('#menu');
let loginbtns = document.querySelectorAll('.loginBtns')
let signupBtns = document.querySelectorAll('.signupBtns')

for (btn of loginbtns) {
    btn.addEventListener('click', () => {
        document.querySelector('#login').style.display = 'flex';
        document.querySelector('#signup').style.display = 'none';
        menug.classList.remove('men');
        document.querySelector('#edit_form').style.display = 'none';
    })
}
for (btn of signupBtns) {
    btn.addEventListener('click', () => {
        document.querySelector('#signup').style.display = 'flex';
        document.querySelector('#login').style.display = 'none';
        menug.classList.remove('men');
        document.querySelector('#edit_form').style.display = 'none';
    })
}

document.querySelector('#lcancel').addEventListener('click', () => {
    document.querySelector('#login').style.display = 'none';
})
document.querySelector('#Scancel').addEventListener('click', () => {
    document.querySelector('#signup').style.display = 'none';
})