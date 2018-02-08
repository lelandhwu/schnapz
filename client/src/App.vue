<template>
  <div id="app">
    <nav class="navbar navbar-dark" style="background-color: #DA394A;">
      <a class="navbar-brand" href="#">
        <img src="./assets/schnapz-logo1.png" width="70" height="70" class="d-inline-block align-top" alt="">
        Instructions: Upload an image of food and receive recipes according to the food inside the image. Recipes that have been emailed can be retrieve from "past recipes"
      </a>
    </nav>

    <div class="container-fluid">
        <div class="row justify-content-md-center">
            <img :src="imageSrc" class="img-fluid rounded mx-auto d-block image" alt="Responsive image"> 
        </div>
        <div class="row justify-content-md-center">
          <div class="col-xs-4 col-xs-offset-4 col-sm-4 col-sm-offset-0 col-lg-4 col-lg-offset-0">
            <label class="btn btn-warning btn-file btn-block">
              <i  v-show="loading" class="fa fa-spinner fa-spin"></i>
              Upload an image of food <input @change="uploadImage" type="file" name="image" accept="image/*">
            </label>        
          </div>
        </div>
        <div class="row justify-content-md-center">
          <div class="col-xs-4 col-xs-offset-4 col-sm-4 col-sm-offset-0 col-lg-4 col-lg-offset-0">
             <button type="button"  @click="getRecipes" class="btn btn-warning btn-block"> Past Recipes
              </button>
          </div>
        </div>
        
        <div class="row justify-content-md-center">
          <div class="col-xs-4 col-xs-offset-4 col-sm-4 col-sm-offset-0 col-lg-4 col-lg-offset-0">
            <div class="recipe-list" style="margin-top:18px;" v-if="success2"> 
              
                  <div v-for="pastRecipe in recipes" id="list" v-if="animate">
                    <div class="button-container">
                      <button type="button" class="btn btn-danger btn-block">{{pastRecipe.name}}
                      </button>
                    </div>
                  </div>      
              
            </div>
         
            
            <div class="recipe-list" style="margin-top:18px;" v-if="success">
              
              <div v-for="recipe in message" id="list" v-if="animate">
                <div class="button-container">
                  <button type="button" id="show-modal" @click="selectItem(recipe)" class="btn btn-primary btn-block">{{recipe.recipeName}}
                  </button>
                   <modal v-if="showModal" @close="deselect" :recipe="selectedItem">
                    
                  </modal>
                </div>
              </div>      
             
            </div>
           </div>
        </div>
         
        
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import Modal from './Modal.vue'
import image from './assets/schnapz-logo1.png'
export default {
  name: 'app',
  data () {
    return {
        imageSrc: image,
        success: null,
        success2: null,
        message: '',
        loading: false,
        animate: false,
        showModal: false,
        recipes: '',
        errors: []
        
    }
  },
  components: {
    Modal
  },
  methods: {
    selectItem(item) {
      this.selectedItem = item
      this.showModal = true
    },
    deselect() {
      this.selectedItem = undefined
      this.showModal = false
    },
    getRecipes() {
      var _this = this;
      _this.loading = true;
      _this.animate = false;
      axios.get('https://peaceful-sands-18853.herokuapp.com/recipes')
      .then(response => {
        // JSON responses are automatically parsed.
        _this.loading = false;
        _this.success = false;
        _this.success2 = true;
        _this.animate = true;
        _this.recipes = response.data.recipes;
  
      })
      .catch(e => {
        console.log(e)
        this.errors.push(e)
      })
    },
    uploadImage: function(e) {
      var files = e.target.files;
      if(!files[0]) {
        return;
      }
      var data = new FormData();
      data.append('image', files[0]);
      var reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target.result;
      };
      var _this = this;
      _this.loading = true;
      _this.animate = false;
      axios.post('https://peaceful-sands-18853.herokuapp.com/uploads', data, {headers: { 'Content-Type': 'multipart/form-data' } }).then(function (response) {
        _this.loading = false;
        if(!response.data.error) {
          reader.readAsDataURL(files[0]);
          _this.success2 = false;
          _this.success = true;
        } else {
          _this.imageSrc = image;
          _this.success = false;
        }
        _this.animate = true;
        _this.message = JSON.parse(response.data.message);
       
      }).catch(function (error) {
        this.loading = false;
        console.log(error.response) // catch your error
      });
    }
  }
}
</script>

<style lang="scss">
$total-items: 10;
#list {
  animation: fadeIn 0.5s linear;
  animation-fill-mode: both;
}
@for $i from 1 through $total-items {
  #list:nth-child(#{$i}) {
    animation-delay: .25s * $i;
  }
}
@-webkit-keyframes fadeIn {
  0% {
    opacity: 0;
    top: 100px;
  }
  75% {
    opacity: 0.5;
    top: 0px;
  }
  100% {
    opacity: 1;
  }
}
.full {
  display: block;
    width: 100%;
}
.fa-spin-fix .fa-spin {
    position: absolute;
    -webkit-transform-origin: 50% calc(50% - .5px);
    transform-origin: 50% calc(50% - .5px);
}
.btn-file {
    position: relative;
    overflow: hidden;
    background-color: #FFA07A


}
.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    font-size: 100px;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    background: white;
    cursor: inherit;
    display: block;
}
.button-container {
  margin-bottom: 10px;
}
.image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 30%;
  height: 30%;
}



/*
  Based on:
  1. http://stephen.io/mediaqueries
  2. https://css-tricks.com/snippets/css/media-queries-for-standard-devices/
*/

/* iPhone 6 in portrait & landscape */
@media only screen 
and (min-device-width : 375px) 
and (max-device-width : 667px) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 6 in landscape */
@media only screen 
and (min-device-width : 375px) 
and (max-device-width : 667px) 
and (orientation : landscape) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 6 in portrait */
@media only screen 
and (min-device-width : 375px) 
and (max-device-width : 667px) 
and (orientation : portrait) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 6 Plus in portrait & landscape */
@media only screen 
and (min-device-width : 414px) 
and (max-device-width : 736px) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 6 Plus in landscape */
@media only screen 
and (min-device-width : 414px) 
and (max-device-width : 736px) 
and (orientation : landscape) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 6 Plus in portrait */
@media only screen 
and (min-device-width : 414px) 
and (max-device-width : 736px) 
and (orientation : portrait) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 5 & 5S in portrait & landscape */
@media only screen 
and (min-device-width : 320px) 
and (max-device-width : 568px) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 5 & 5S in landscape */
@media only screen 
and (min-device-width : 320px) 
and (max-device-width : 568px) 
and (orientation : landscape) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}

/* iPhone 5 & 5S in portrait */
@media only screen 
and (min-device-width : 320px) 
and (max-device-width : 568px) 
and (orientation : portrait) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}


/* Galaxy S5 portrait and landscape */
@media screen 
  and (device-width: 360px) 
  and (device-height: 640px) 
  and (-webkit-device-pixel-ratio: 3) {
  .image {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 70%;
  height: 70%;
}
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}

}


/*Galaxy S7 and S8 */
@media only screen and (min-device-width : 360px) and (max-device-width : 640px){

  .image {
    height: 60%;
    width: 100%;
  }
html, body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
}
 

}




</style>
