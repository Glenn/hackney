
//---------------- Getting a reference to the player -----------------

//store a reference to the flash video player
var player = null;

/*
* This function is called by the video player swf file when the player has been initiated 
* id is the id that will contain the flash movie

****** NOTE: The ID needs to be set in the FlashVars of the embed of the swf movie *******
*/
function onPlayerInitiated(id)
{
	player = document.getElementById(id);
	//alert("got player id=" + id + " player="+ player);
}


/**
* the following functions control the state of the video player - all possible functions are listed below
*/

//change the video playing
function changeVideo(url)
{
	player.send("mediaURL", url);
}

//change the captions
function changeCaptions(url)
{
	player.send("captionsURL", url);
}

//change the audio description
function changeAudioDescription(url)
{
	player.send("audioDescriptionURL", url);
}

//change the poster image shown before the video playes
function changeImage(url)
{
	player.send("imageURL", url);
}



//start playback
function play()
{
	player.send("control", "play");
}

//pause playback
function pause()
{
	player.send("control", "pause");
}

//skips 2 seconds forward
function fastforward()
{
	player.send("control", "fastforward");
}

//skips 2 seconds back
function rewind()
{
	player.send("control", "rewind");
}

//resart the video
function restart()
{
	player.send("control", "restart");
}

//toggle mute on/off
function togglemute()
{
	player.send("control", "togglemute");
}

//increase volume by 1
function volumeup()
{
	player.send("control", "volumeup");
}

//decrease volume by 1
function volumedown()
{
	player.send("control", "volumedown");
}

//toggle captions on/off
function togglecaptions()
{
	player.send("control", "togglecaptions");
}

//toggle shortcut screen on/off
function togglehelp()
{
	player.send("control", "togglehelp");
}

//toggle audiodescription on/off
function toggleaudiodescription()
{
	player.send("control", "toggleaudiodescription");
}

//change the text size
function changetextsize()
{
	player.send("control", "changetextsize");
}

//change the text colour
function changetextcolour()
{
	player.send("control", "changetextcolour");
}


//THE FOLLOWING EXAMPLES OF HOW THE ABOVE CAN BE USED

//---------------- Controlling the player ---------------------------

/**
* Example function that will change all the assets for the video player
* If some of the assets do not exist or the file path is incorrect the player will ignore that asset and the respective button (if any) will be removed from the player toolbar.
* 
*/
function changeMedia(value)
{
	//alert("change"+value);
	
	switch(value)
	{
		case "FLV" :
			changeVideo("video/dummy_video.flv");
			changeCaptions("assets/en/captions/dummy_captions.xml");
			changeAudioDescription("assets/audio/dummy_audiodesc.mp3");
			changeImage("assets/images/dummy_still.jpg");
		break;
		//
		case "YOUTUBE":
			changeVideo("Oe3St1GgoHQ");
		break;
		//
		case "AUDIO" :
			changeVideo("assets/audio/swinging_jazz_bass_30.mp3");
			changeImage("assets/images/dummy_still.jpg");
		break;
	}
}


//----------------------- Transcript control --------------------


/**
* example function to toggle the transcript on/off
*/
function toggleTranscript() 
{
if(document.getElementById('transcript') && document.getElementById('viewTranscript') && document.getElementById('transcriptTextAlt'))
{
	var viewtranscriptObj = document.getElementById('viewTranscript')
	var transcriptObj = document.getElementById('transcript')
	var transcriptTextShow = ""
	var transcriptTextHide = ""
		if(document.getElementById('transcriptTextShow'))
		{
			var transcriptTextShow = document.getElementById('transcriptTextShow').innerHTML
		}
		if(document.getElementById('transcriptTextHide'))
		{
			var transcriptTextHide = document.getElementById('transcriptTextHide').innerHTML
		}
	
		if (transcriptObj.style.display == 'block') 
		{
			transcriptObj.style.display = 'none';
			if (transcriptTextShow != "") 
			{
				document.getElementById('transcriptText').innerHTML = transcriptTextShow;		
			}
			else
			{
				document.getElementById('transcriptText').innerHTML = "Show transcript";
			}
		} 
		else
		{
			transcriptObj.style.display = 'block';
			if (transcriptTextHide != "") 
			{
				document.getElementById('transcriptText').innerHTML = transcriptTextHide;	
			}
			else
			{
				document.getElementById('transcriptText').innerHTML = "Hide transcript";
			}
		}
	}
}


