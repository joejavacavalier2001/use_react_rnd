var onlyOnce=1;
var slidenum=0;
var imgelement=0;
var my_prefix="";	// simulate BaseURI for images

function
myOnTime(duration, position)
{
    if (onlyOnce)
    {
	// console.log("Called duration: " + duration + " positon " + position);

	onlyOnce=0;
	slidenum=0;
	my_prefix="";

	// call into whiteboard
	wb_init();
    }
    if (slidenum >= myslides.length) return;

    var slidetime=fixtime(myslides[slidenum].Position);

    /*
    console.log("Position " + position +
	slidetime ? " awaiting slide time " + slidetime : ""
	);
    */

    // 0 slidetime just means to do it next, immediately after previous one
    if (slidetime && (position < slidetime)) return;

    if (position >= slidetime)
    {
	var action=myslides[slidenum].Jump;
	if (action)
	{
	    slidenum++;
	    var myjump=fixtime(action);
	    // console.log("jump to " + action + " " + myjump);
	    if (myjump > duration) myjump = duration;
	    jwplayer().seek(myjump);
	    return;
	}
	var myimage=myslides[slidenum].Slide;
	if (myimage)
	{
	    slidenum++;
	    /*
	    console.log("Time for slide " + slidenum
		+ " time " + slidetime + " image: " + myimage);
	    */

	    /* check for need for prefix */
	    if ((myimage.slice(0,1) == '+') && my_prefix)
	    {
		var orig = myimage;
		myimage = my_prefix + "/" + myimage.slice(1);
		/* console.log("Image: " + orig + " Prefix: " + my_prefix + " --> " + myimage); */
	    }
	    /* update the image */
	    wb_img(myimage);

	    return;
	}
	var mytext=myslides[slidenum].Text;
	if (mytext)
	{
	    slidenum++;
	    /* console.log("Time for text " + slidenum
		+ " time " + slidetime + " text: " + mytext); */
	    wb_text(mytext);
	    return;
	}
	var myclear=myslides[slidenum].Clear;
	if (myclear)
	{
	    slidenum++;
	    // console.log("Time for clear " + slidenum + " time " + slidetime);
	    wb_gclear();
	}
	var mygesture=myslides[slidenum].Gesture;
	if (mygesture)
	{
	    slidenum++;
/*
	    console.log("Time for gesture " + slidenum
		+ " time " + slidetime + " gesture: " + mygesture);
*/
	    var j = "wb_gesture(" + mygesture + ")";
	    eval(j);
	}
	var myprefix=myslides[slidenum].Prefix;	// global
	if (myprefix)
	{
	    slidenum++;
		/*
	    console.log("Prefix " + slidenum
		+ " time " + slidetime + " myprefix: " + myprefix);
		*/
	    /* update the gloabal prefix */
		my_prefix = myprefix; // my_prefix is global, temp is local

	    return;
	}
    }
}
