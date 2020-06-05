function
media_init(myfile,mydiv,mywidth,myheight)
{
    if (!mydiv) mydiv="vid";
    if ((!mywidth) && (!myheight))
    {
	$(document).ready(function()
	{
	    jwplayer(mydiv).setup(
	    {
		aspectratio: '16:9',
		primary: 'html5',
		file: myfile,
		events:
		{
	/* this is the main event callback from JWPlayer into slides code */
		    onTime: function()
		    {
			var d = this.getDuration();
			var p = this.getPosition();
			myOnTime(d,p);
		    },
		    onReady: function() { this.play(); }
		}
	    });
	});
    }
    else
    {
	$(document).ready(function()
	{
	    jwplayer(mydiv).setup(
	    {
		aspectratio: '16:9',
		primary: 'html5',
		file: myfile,
		height: myheight,
		width: mywidth,
		events:
		{
	/* this is the main event callback from JWPlayer into slides code */
		    onTime: function()
		    {
			var d = this.getDuration();
			var p = this.getPosition();
			myOnTime(d,p);
		    },
		    onReady: function() { this.play(); }
		}
	    });
	});
    }
}
