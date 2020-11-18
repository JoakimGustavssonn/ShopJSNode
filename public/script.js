
// Get the modal
const modal = document.getElementById('Modal');
// Get the image and insert it inside the modal - use its "alt" text as a caption
const img = document.getElementsByClassName('JS-img-click');
const modalDesc = document.getElementById("modal-desc");



for (let i = 0; i < img.length; i++) {
    img[i].addEventListener('click', function() {
                
        modal.style.display = "flex";
        modalDesc.innerHTML = this.nextElementSibling.innerHTML;
                
        

    });

   
   
}


// When the user clicks on <span> (x), close the modal
modal.onclick = () => { 
    modal.style.display = "none";
    
}




      
