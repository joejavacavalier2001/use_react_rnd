function
my_debug(txt)
{
    console.log(txt);
}

var start_image;
var canvas;
var context;

function
wb_init()
{
    // if the document already has a canvas, we use it, ow, append one
    canvas = document.getElementsByTagName('canvas')[0];
    if (!canvas)
    {
	// my_debug("init: creating canvas");
	canvas = document.createElement("CANVAS");
	document.body.appendChild(canvas);
    }
    context = canvas.getContext('2d');

    // my_debug("init: canvas shadow offset " + context.shadowOffsetX + " " + context.shadowOffsetY);
}

function
wb_img(url)
{
    start_image = new Image();
    start_image.onload = LoadStartImage;
    start_image.src = url;
}


function
LoadStartImage()
{
    if (start_image)
    {
	canvas.setAttribute('width', start_image.width);
	canvas.setAttribute('height', start_image.height);
	context.drawImage(start_image, 0, 0); // draw the image onto the canvas
    }
}


function
wb_gclear()
{
     if (canvas && start_image)
     {
	 canvas.setAttribute('width', start_image.width);
	 canvas.setAttribute('height', start_image.height);
	 context.drawImage(start_image, 0, 0); // draw the image onto the canvas
     }
}

function
wb_gesture(x,y,w,h)
{
    // my_debug("starting wb_gesture " + w + " " + h + " " + x + " " + y);
    if (context)
    {
	 context.globalAlpha=0.4;
	 context.fillStyle = 'lime';
	 context.fillRect(x,y,w,h);
    }
}

/* prefer to write to the messages div, but if none, open/use a popup window */
var text_window = 0;
var messages_div = 0;

function
wb_text(txt)
{
    if (!messages_div)
    {
	messages_div = document.getElementById('messages');
    }
    if ((!messages_div) && (!text_window))
    {
	text_window =
	    window.open("","text",
		"scrollbars=1,status=1,width=350,height=150");
    }
    if (messages_div)
    {
	messages_div.innerText += txt + '\n';
	messages_div.scrollTop = messages_div.scrollHeight;
    }
    else
    {
	text_window.document.write('<h3>' + txt + '</h3>');
	if (text_window.scrollByLines) // works on firefox, not on chrome
	{
	    text_window.scrollByLines(5);
	}
	else if (text_window.scrollBy)
	{
	    text_window.scrollBy(0,100);
	}
    }
}
