// Open Weather Map API key
var apiKey = "6829f0642d2909921860de59f3c2dc9d";

// function to search current weather of searched city 
function searchCity(event){
   
    event.preventDefault();
    
    var cityInput = $("#searchcity").val();
    
    if(cityInput === "")
    {
        return;
    } 
   
    searchCurrentWeather(cityInput);
    
    populateSearchHistory(cityInput);
    
    $("#searchcity").val("");
}

// function to fetch current weather of city from current weather data api on openweather.
function searchCurrentWeather(city){

    // The search string to get weather for a city
    var searchQueryURL = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+ apiKey; 

    // Seach Current Weather
        fetch(searchQueryURL)
        .then (response => response.json())
        .then(function(response){

        // Convert the temp to fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;

        // Convert Kelvin to celsius : 0K − 273.15 = -273.1°C   
        var tempC = (response.main.temp - 273.15);

        var currentDate = new Date().toLocaleDateString();
     
        var latitude = response.coord.lat;
        var longitude = response.coord.lon;
        
        
        var uvQueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat="+latitude+"&lon="+longitude+"&appid="+ apiKey;

        var cityId = response.id;
        
        // Search string to get the forcast
        var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id="+cityId+"&units=imperial&appid="+apiKey;
          
        $("#city-card").show();
        
        $("#temperature").text("Temperature : "+tempF.toFixed(2)+" °F/ "+tempC.toFixed(2)+"°C"); 
        $("#humidity").text("Humidity : "+response.main.humidity+" %");
        $("#windspeed").text("Wind Speed : "+response.wind.speed+" MPH");

        var imageIcon = $("<img>").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon.toString() + ".png");

        $("#city-name").text(response.name + " ("+currentDate+") ").append(imageIcon);

        getUVIndex(uvQueryURL); 

        showForecast(forecastQueryURL);
        
    });   

}

//function to get UV index
function getUVIndex(uvQueryURL){

    
    fetch (uvQueryURL)

    .then (response => response.json())
    .then(function(uvResponse){
    
        var uvValue = uvResponse.value;
        
        var uvButton = $("<button>").attr("type","button").text(uvValue);
        
        // Conditional statements to get color for uv index card
        if(uvValue >= 0 && uvValue <= 3){
            
            //low : green
            $("#uvindex").text("UV : Low, ").append(uvButton);
            uvButton.addClass("btn bg-success");
        }
        else if(uvValue >= 3 && uvValue <= 6){
            
            //moderate : yellow
            $("#uvindex").text("UV : Moderate, ").append(uvButton);
            uvButton.addClass("btn yellowBtn");
        } 
        else if(uvValue >= 6 && uvValue <= 8){
            
            //high : orange
            $("#uvindex").text("UV : High, ").append(uvButton);
            uvButton.addClass("btn orangeBtn");
        }
        else if(uvValue >= 8 && uvValue <= 10){
            
            //very high : red
            $("#uvindex").text("UV : Very high, ").append(uvButton);
            uvButton.addClass("btn bg-danger");
        }
        else if(uvValue >= 10){
            
            //extreme : violet
            $("#uvindex").text("UV : Extreme, ").append(uvButton);
            uvButton.addClass("btn violetBtn");
        }
    });
}

//function to show 5 days forecast 
function showForecast(forecastQueryURL){

    var temp, humidity,icon;

    $("#5DayForecast").show();

    fetch(forecastQueryURL)
    .then (response => response.json())
    .then(function(forecastResponse){

        $("#forecast").empty();

        var list = forecastResponse.list;

        for(var i = 0 ; i < list.length ;i++){
            
            var date = list[i].dt_txt.split(" ")[0];
            var dateArr = date.split("-");
            
            var dateForecast = dateArr[1]+"/"+dateArr[2]+"/"+dateArr[0];
            var time = list[i].dt_txt.split(" ")[1];

            if(time === "12:00:00"){

                temp = list[i].main.temp;
                humidity = list[i].main.humidity;
                icon = list[i].weather[0].icon;

                var card = $("<div>").addClass("card bg-primary text-white");
                var cardBody = $("<div>").addClass("card-body");
                
                var fDate = $("<h5>").addClass("card-text").text(dateForecast);
                
                var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon + ".png"); 
                
                var tempP  = $("<p>").addClass("card-text").text("Temp: "+temp+"°F");
                
                var humidityP = $("<p>").addClass("card-text").text("Humidity : "+humidity+" % ");

                cardBody.append(fDate, imgIcon, tempP, humidityP);
                card.append(cardBody);

                $("#forecast").append(card);
            }
       
        }
    });
}

// function to store and populate search history
function populateSearchHistory(city){

    var history = JSON.parse(localStorage.getItem("history"));  
    var listitem;

    if(history){

        for(var i = 0 ; i < history.length; i++){
            
            if(history[i] === city){
                return;
            }         
        } 
        history.unshift(city); 
        listitem = $("<li>").addClass("list-group-item previousCity").text(city);
        $("#historylist").prepend(listitem);    
    }
    else{
            history = [city]; 
            
            listitem = $("<li>").addClass("list-group-item previousCity").text(city);
            $("#historylist").append(listitem);

    }

    localStorage.setItem("history", JSON.stringify(history));   
}


// onclick function on search history city to load weather of that city 
$("#historylist").on("click", "li", function(event){

    var previousCityName = $(this).text();
    console.log("Previous city : "+ previousCityName);

    searchCurrentWeather(previousCityName);

});

// Execute script when html is fully loaded
$(document).ready(function(){

    $("#searchButton").on("click",searchCity);

    var history = JSON.parse(localStorage.getItem("history"));  
    
    // if search history exists in local storage
    if (history) {
        var lastSearchedCity = history[0];  //gets last searched city from localstorage
        searchCurrentWeather(lastSearchedCity); //loads last searched city's weather

        for(var i = 0 ; i < history.length; i++){
            
            var listitem = $("<li>").addClass("list-group-item previousCity").text(history[i]);  
            $("#historylist").append(listitem);    
            
        }
    } else {
        $("#city-card").hide();
        $("#5DayForecast").hide();
    }
});