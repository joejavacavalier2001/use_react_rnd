function
fixtime(s)
{
    var str = s + "";
    var num = str;
    var nums = str.split(":");
    if (nums.length == 1)
    {
	return num * 1;
    }
    num = nums[0] * 60 + nums[1] * 1;
    if (nums.length > 2)
    {
	num = num * 60 + nums[2] * 1;
    }
    return num;
}
