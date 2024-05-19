document.querySelector('#Listing_Delete').addEventListener('click', () => {
    document.querySelector('#confirm').style.display = 'flex';
});

document.querySelector('#deleteCancel').addEventListener('click', () => {
    document.querySelector('#confirm').style.display = 'none';

})

document.querySelector('#Edit').addEventListener('click', () => {

    document.querySelector('#edit_form').style.display = 'flex';

})
document.querySelector('#Editcancel').addEventListener('click', () => {
    document.querySelector('#edit_form').style.display = 'none';
    document.querySelector('#signup').style.display = 'none';
     document.querySelector('#login').style.display = 'none';

})
// document.querySelector('#saveChanges').addEventListener('click', () => {

//     document.querySelector('#edit_form').style.display = 'none';

// })

