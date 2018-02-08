<!-- template for the modal component -->
<template type="text/x-template" id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              {{recipe.recipeName}}
            </slot>
          </div>
           <div class="modal-body">
            <slot name="body">
               Rating: {{ recipe.recipe.rating }}/5
            </slot>
          </div>
          <div class="modal-body">
            <slot name="email">
               <a target="_blank" v-bind:href="url"> {{ recipe.recipe.source.sourceRecipeUrl }}</a> 
            </slot>
          </div>
          <div class="modal-body">
            <slot name="body">
              <label> send recipe to: </label>
               <input type="text" v-model="postBody"/>
                <button type="button"  @click="postPost" class="btn btn-primary">send</button>

            </slot>
               <div class="alert alert-success" style="margin-top:11px; margin-bottom:11px;" v-if="success === true">
            {{ message }}
            </div>
          </div>
          <div class="modal-footer">
            <slot name="footer">
               
            
              <button id="close" class="btn btn-primary" @click="$emit('close')">
                close
              </button>

            </slot>
          </div>

        </div>
      </div>
    </div>
  </transition>
</template>


<script>
import axios from 'axios';
export default {
  name: 'Modal',
  props: ['recipe'],
  data () {
    return {
       url: this.recipe.recipe.source.sourceRecipeUrl,
       postBody: '',
       success: null,
       message: '',
    }
  },
  methods: {
    postPost() {
        var _this = this;
        axios.post('https://peaceful-sands-18853.herokuapp.com/sendEmail', {
          to: this.postBody,
          subject: "schnapz project",
          body: this.recipe.recipe.source.sourceRecipeUrl,
          name: this.recipe.recipeName,
          rating: this.recipe.recipe.rating
        })
        .then(response => {
          _this.success = true;
          _this.message = JSON.parse(response.data.message);
        })
        .catch(e => {
          this.errors.push(e)
        })
        var _this = this;
    }
  }
  
}
</script>

<style>
#subject {
  display: none;
}
#body {
  display: none;
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}
.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
.modal-container {
  width: 700px;
  height: 500px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}
.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}
.modal-body {
  margin: 20px 0;
}
.modal-default-button {
  float: right;
}
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */
.modal-enter {
  opacity: 0;
}
.modal-leave-active {
  opacity: 0;
}
.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
