let serverURL;
let serverPort;
let url;
let editing = false;

// Get the JSON File
$.ajax({
  url: 'config.json',
  type: 'GET',
  dataType: 'json',
  success:function(keys){
    serverURL = keys['SERVER_URL'];
    serverPort = keys['SERVER_PORT'];
    url = `${keys['SERVER_URL']}:${keys['SERVER_PORT']}`;
    getProductsData();
  },
  error: function(){
    console.log('cannot find config.json file, cannot run application');
  }
});

// Get all the products
getProductsData = () => {
    $.ajax({
        url: `${url}/allProducts`,
        type: 'GET',
        dataType: 'json',
        success:function(data){
            $('#productList').empty();
            for (var i = 0; i < data.length; i++) {
                let product = `
                    <li
                        class="list-group-item d-flex justify-content-between align-items-center productItem"
                        data-id="${data[i]._id}"
                    >
                        <span class="productName">$${data[i].price} | ${data[i].name}</span>`;
                        if(sessionStorage['userName']){
                            product += `<div>
                                            <button class="btn btn-info editBtn">Edit</button>
                                            <button class="btn btn-danger removeBtn">Remove</button>
                                        </div>`;
                        }
                    product += `</li>
                `;

                $('#productList').append(product);
            }
        },
        error: function(err){
            console.log(err);
            console.log('something went wrong with getting all the products');
        }
    })
}

//Add or Edit a product
$('#addProductButton').click(function(){
    event.preventDefault();
    let productName = $('#productName').val();
    let productPrice = $('#productPrice').val();
    if(productName.length === 0){
        console.log('please enter a products name');
    } else if(productPrice.length === 0){
        console.log('please enter a products price');
    } else {
        if(editing === true){
            const id = $('#productID').val();
            $.ajax({
                url: `${url}/product/${id}`,
                type: 'PATCH',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productID').val(null);
                    $('#addProductButton').text('Add New Product').removeClass('btn-warning');
                    $('#heading').text('Add New Product');
                    editing = false;
                    const allProducts = $('.productItem');
                    allProducts.each(function(){
                        if($(this).data('id') === id){
                            $(this).find('.productName').text(productName);
                        }
                    });
                },
                error: function(err){
                    console.log(err);
                    console.log('something went wront with editing the product');
                }
            })
        } else {
            $.ajax({
                url: `${url}/product`,
                type: 'POST',
                data: {
                    name: productName,
                    price: productPrice
                },
                success:function(result){
                    $('#productName').val(null);
                    $('#productPrice').val(null);
                    $('#productList').append(`
                        <li class="list-group-item d-flex justify-content-between align-items-center productItem">
                            <span class="productName">${result.name}</span>
                            <div>
                                <button class="btn btn-info editBtn">Edit</button>
                                <button class="btn btn-danger removeBtn">Remove</button>
                            </div>
                        </li>
                    `);
                },
                error: function(error){
                    console.log(error);
                    console.log('something went wrong with sending the data');
                }
            })
        }

    }
})

// Edit button to fill the form with exisiting product
$('#productList').on('click', '.editBtn', function() {
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    $.ajax({
        url: `${url}/product/${id}`,
        type: 'get',
        dataType: 'json',
        success:function(product){
            $('#productName').val(product['name']);
            $('#productPrice').val(product['price']);
            $('#productID').val(product['_id']);
            $('#addProductButton').text('Edit Product').addClass('btn-warning');
            $('#heading').text('Edit Product');
            editing = true;
        },
        error:function(err){
            console.log(err);
            console.log('something went wrong with getting the single product');
        }
    })
});

// Remove a product
$('#productList').on('click', '.removeBtn', function(){
    event.preventDefault();
    const id = $(this).parent().parent().data('id');
    const li = $(this).parent().parent();
    $.ajax({
      url: `${url}/product/${id}`,
      type: 'DELETE',
      success:function(result){
        li.remove();
      },
      error:function(err) {
        console.log(err);
        console.log('something went wrong deleting the product');
      }
    })
});

// Login button
$('#loginTabBtn').click(function(){
    event.preventDefault();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('#loginForm').show();
    $('#registerForm').hide();
});

// Register button
$('#registerTabBtn').click(function(){
    event.preventDefault();
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    $('#loginForm').hide();
    $('#registerForm').removeClass('d-none').show();

});

// Register Form
$('#registerForm').submit(function(){
    event.preventDefault();
    // Get all the values from the input fields
    const username = $('#rUsername').val();
    const email = $('#rEmail').val();
    const password = $('#rPassword').val();
    const confirmPassword = $('#rConfirmPassword').val();

    // We are including basic validation
    // Eventually we would need to include a more thorough validation (required, min, max values, emails, uniques, etc)
    // For time sake we are just checking to see if there is a value in each input field
    if(username.length === 0){
        console.log('please enter a username');
    } else if(email.length === 0){
        console.log('please enter an email');
    } else if(password.length === 0){
        console.log('please enter a password');
    } else if(confirmPassword.length === 0){
        console.log('please confirm your password');
    } else if(password !== confirmPassword){
        // We also need to check if the two passwords match
        console.log('your passwords do not match');
    } else {
        // Once all the validation has passed we run our ajax request to our register route
        $.ajax({
            url: `${url}/users`,
            type: 'POST',
            data: {
                username: username,
                email: email,
                password: password
            },
            success:function(result){
                console.log(result);
            },
            error:function(err){
                console.log(err);
                console.log('Something went wrong with registering a new user');
            }
        })
    }
});

// Login Form
$('#loginForm').submit(function(){
    event.preventDefault();
    // Get the two input fields
    const username = $('#lUsername').val();
    const password = $('#lPassword').val();

    // Add in the simple validation to make sure people input a value
    if(username.length === 0){
        console.log('please enter a username');
    } else if(password.length === 0){
        console.log('please enter a password');
    } else {
        // Send an ajax request to our login route.
        // Even though we are getting back a user, beacuse we are dealing with secure data (password), we want to use a POST request
        $.ajax({
            url: `${url}/getUser`,
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success:function(result){
                // the result value is whatever gets sent back from the server.
                if(result === 'invalid user'){
                    // If someone tries to login with a username that doesnt exist
                    console.log('cannot find user with that username');
                } else if(result === 'invalid password'){
                    // If someone logs in with a valid username but the password is wrong
                    console.log('Your password is wrong');
                } else {
                    // If someone logs in with a valid username and a valid password
                    console.log('lets log you in');
                    console.log(result);

                    // sessionStorage (and LocalStorage) allows you to save data into your web browser and will stay there until they get removed
                    // sessionStorage will keep data until the session is finsihed (closing the tab or browser)
                    // localStorage will keep the data forever until someone manually clears the localStorage cache.
                    // This is how we will be creating our login system
                    // If we save a value into sessionStorage or localStorage, if we keep refreshing our page, the value we saved will still be there.
                    // In our document.ready() function bellow we are checking to see if there is a value in our sessionStorage called user_Name
                    sessionStorage.setItem('userID', result['_id']);
                    sessionStorage.setItem('userName', result['username']);
                    sessionStorage.setItem('userEmail', result['email']);
                    getProductsData();
                    $('#authForm').modal('hide');
                    $('#loginBtn').hide();
                    $('#logoutBtn').removeClass('d-none');
                    $('#addProductSection').removeClass('d-none');
                }
            },
            error:function(err){
                console.log(err);
                console.log('Something went wrong with logging in.');
            }
        })
    }
});

// Log out button
$('#logoutBtn').click(function(){
    sessionStorage.clear();
    getProductsData();
    $('#loginBtn').show();
    $('#logoutBtn').addClass('d-none');
    $('#addProductSection').addClass('d-none');
});

// The modal appears onload
$(document).ready(function(){

    if(sessionStorage['userName']){
        console.log('you are logged in ');
        $('#loginBtn').hide();
        $('#logoutBtn').removeClass('d-none');
        $('#addProductSection').removeClass('d-none');

    } else {
        // you aren't logged in
        console.log('please sign in');
    }

    console.log(sessionStorage);
})
