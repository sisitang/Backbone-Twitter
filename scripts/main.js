(function(_, Backbone) {

	//Initiate global variables
	var init_res_num = 10; // set the initial number of results
	var keywords="", valid=false; 
	
	//Prompt the user to enter a search string to initialize the twitter feed
	try {
		while(!valid) {
			keywords = prompt("Please enter keywords to start searching on Twitter :)" , "");
			valid = (valReq(keywords) && valString(keywords));
		}
	}
	catch(err) {
		//In case, set a initial keyword
		keywords = "vancouver";
	} 

	
	//Show the "Loading" sign until get tweets
	$(".loading").html("Loading ... ...");
	
	//Create the model for a tweet	
	var Tweet = Backbone.Model.extend();

	//Create the collection for a set of tweets
	var Tweets = Backbone.Collection.extend({
		model: Tweet,
		//Set inital URL
		url: "phpproxy.php?q="+ encodeURIComponent(keywords) + "&count=" + encodeURIComponent(init_res_num), 
		initialize : function(){
        },
		parse: function(response) {
			//make date more readable
			$.each(response.statuses, function(i,val){
				val.text = linkify( val.text );                                              //Text with links in text clickable
				val.user.profile_image_url = '<img src=' + val.user.profile_image_url + '>'; //User profile image with a link
				val.id_str = '<a href="http://twitter.com/' + val.user.screen_name           //User screen name with a link
                                    + '/status/' + val.id_str + '">Original tweet</a>';
				val.user.screen_name = '<a href="http://twitter.com/' + val.user.screen_name + '">@' + val.user.screen_name + '</a>';
				val.retweet_count = 'Retweets: ' + val.retweet_count;                        //Retweets count
			})

			console.log('parsing'); // for testing
			console.log(response.statuses); //for testing

			return response.statuses;
		},
	})	
	
	//Create the view for the page
	var SearchView = Backbone.View.extend({
		initialize: function(models, options){
			   
			//Create two optional variable: keywords and the number of results
			options || (options = {});
			if (options.keywords) {
				this.keywords = options.keywords;
			};			
			if (options.res_num) {
				this.res_num = options.res_num;
			};			  

			this.collection = new Tweets;
			
			//Get the first tweets based on the first keyword from the prompt
			var that = this;
			this.collection.fetch({
				success: function (s) {
					console.log("Fetched!", s);
					$(".loading").hide();
					that.render();
				},
				error: function (s) {
					console.log("Error!", s);
					$(".loading").hide();
					that.render();
				}

			});
			
			//Refresh tweets per 20s
			setInterval(function(){
			  that.refresh();
			  console.log("auto refresh......");
			}, 20000)
			  
		},
		 
		el: $('#tweetContainer'),
		
		//Use an external template
		template: _.template($('#tweettemplate').html()),
		 
		render: function() {
			// Fill the html with the template and the collection
			$(this.el).html(this.template({ tweets: this.collection.toJSON(), keywords: this.keywords, res_num: this.res_num }));
		},
		 
		//Define events for the search area
		events : {
			'click .refresh' : 'refresh',
			'mouseover  .refresh' : 'showNote',
			'mouseout  .refresh' : 'hideNote',
			"click input[type=button]": "doSearch",
			'keypress input[type=text]': 'searchOnEnter',
			"change #res_num": "change_res_num"
		},
		
		// To refresh tweets - refresh button event
		refresh:function( event ){
			var that = this;
			this.collection.fetch({
				success: function (s) {
					console.log("refresh.......");
					$(".loading").hide();
					that.render();
				}
			});
		},

		// To search - enter key event
		searchOnEnter: function( event ){
			if (event.keyCode != 13) return;
			this.doSearch(event);
		},
		
		// To search - search button event
		doSearch: function( event ){
			var subject = $('#search_input').val();
			if (valString(subject)){
				//set URL with new parameters
				this.collection.url = "phpproxy.php?q="
									  + encodeURIComponent(subject.trim()) 
									  + "&count=" 
									  + encodeURIComponent(this.res_num);			
				console.log("URL" + this.collection.url);
				//update keywords
				this.keywords = subject.trim();	

				var that = this;
				this.collection.fetch({
				success: function (s) {
					console.log("searching......", s);
					that.render();
				}
			  });
			}else{
				alert("Please enter keywords :)")
			}
		},

		showNote : function( event ) {
			$(".note").show();
		},

		hideNote : function( event ) {
			$(".note").hide();
		},
		
		// Change results count and refresh tweets - select event
		change_res_num : function( event ){
			this.res_num = $("#res_num").val();
			this.collection.url = this.collection.url + "&count=" + this.res_num;
			this.refresh( event );
		}
	})
	
	// Initiate a view
	var tsfeed = new SearchView([],{keywords:keywords},{res_num : init_res_num});
})(this._, this.Backbone);

// Show the back-to-top sign
$(window).scroll(function(){
	if($(window).scrollTop() > 200){
		$(".tag").show();
	}else{
		$(".tag").hide();
	}
})


/* Validate a string 
**************************************/
function valString(val) {
	if ( val.trim() == "") return false;
	return true;
}
function valReq(val) {
	return (val);
}

/* Make links, usernames and hashtags within tweets clickable
*************************************************************************************/
function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //URLs starting with "@" .
    replacePattern3 = /\B@([\w-]+)/gm;
    replacedText = replacedText.replace(replacePattern3, '<a href="http://twitter.com/$1" target="_blank">@$1</a>');

    //URLs starting with "#" .
    replacePattern4 = /\B#([\w-]+)/gm;
    replacedText = replacedText.replace(replacePattern4, '<a href="https://twitter.com/hashtag/$1?src=hash" target="_blank">#$1</a>');
    return replacedText;
}


