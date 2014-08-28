<?php

//Validate the search query
if(!isset($_GET["q"])){
	header("Location: index.php");
	exit;
}

$query = trim($_GET["q"]);


//Path to twitteroauth
require_once("twitteroauth/twitteroauth/twitteroauth.php"); 
 
//Set twitter access parameters
$twitteruser = "sisideveloper";
$consumerkey = "uTbOfuj0iqN2kQPDu6MJfFYQX";
$consumersecret = "IoUaIUQVsstjy3s011CxJcko52GzDyISXhOrX5e87LBIxxW7r7";
$accesstoken = "1892553110-clxLG3EgXY89NgM26CkH4TIT9b9Al4soRw6j5J7";
$accesstokensecret = "B4cL5n9qb9n0zQ4fdfmeF8eINuGjFmOplsQZzJzTlT3vu";
 
//Set tweets' number
$notweets = 10; 

if( isset($_GET["count"]) && (int)trim($_GET["count"]) > 0){
	$notweets = (int)trim($_GET["count"]);
}


//Get connection
function getConnectionWithAccessToken($cons_key, $cons_secret, $oauth_token, $oauth_token_secret) {
	$connection = new TwitterOAuth($cons_key, $cons_secret, $oauth_token, $oauth_token_secret);
	return $connection;
}

//Get tweets 
$connection = getConnectionWithAccessToken($consumerkey, $consumersecret, $accesstoken, $accesstokensecret);
$tweets = $connection->get("https://api.twitter.com/1.1/search/tweets.json?q=" . $query . "&count=" . $notweets . "&include_entities=true&callback=?");
 
//Return JSON array  
echo json_encode($tweets);

?>